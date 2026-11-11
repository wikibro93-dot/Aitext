// AI Video Detector API route for https://www.aitext.tech
// Uses Sightengine's AI-generated video + deepfake detection models.
// Accepts a video file (multipart) or a direct video URL (JSON).
// Short videos (< 1 minute) use the synchronous endpoint for instant results.
import { NextRequest, NextResponse } from "next/server";

const SIGHTENGINE_SYNC_URL =
  "https://api.sightengine.com/1.0/video/check-sync.json";
const SIGHTENGINE_ASYNC_URL =
  "https://api.sightengine.com/1.0/video/check.json";

// Vercel Hobby functions time out at 10s; keep the upstream call bounded.
const UPSTREAM_TIMEOUT_MS = 55000;

function getCredentials() {
  const apiUser = process.env.SIGHTENGINE_API_USER?.trim();
  const apiSecret = process.env.SIGHTENGINE_API_SECRET?.trim();
  return { apiUser, apiSecret };
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
    return Number(v);
  return null;
}

// Sightengine returns scores in a few shapes depending on the model/version.
// Normalise defensively and always pass the raw payload through for debugging.
function normalizeResult(payload: any) {
  const type = payload?.type ?? payload?.result?.type ?? {};
  const genai = type.genai ?? {};
  const deepfake = type.deepfake ?? {};

  const aiScore =
    toNumber(genai.ai_generated) ??
    toNumber(genai.ai) ??
    toNumber(genai.score) ??
    toNumber(payload?.genai) ??
    null;

  const deepfakeScore =
    toNumber(deepfake.score) ??
    toNumber(deepfake.fake) ??
    toNumber(payload?.deepfake) ??
    null;

  // Per-generator confidence scores, when present.
  const generators: Record<string, number> = {};
  const genObj = genai.generators ?? genai.per_generator ?? {};
  if (genObj && typeof genObj === "object") {
    for (const [k, v] of Object.entries(genObj)) {
      const n = toNumber(v);
      if (n !== null) generators[k] = n;
    }
  }

  let verdict: "likely_ai" | "likely_real" | "uncertain" = "uncertain";
  if (aiScore !== null) {
    if (aiScore >= 0.7) verdict = "likely_ai";
    else if (aiScore <= 0.3) verdict = "likely_real";
  }

  return { aiScore, deepfakeScore, generators, verdict, raw: payload };
}

async function callSightengineSync(
  form: FormData,
  apiUser: string,
  apiSecret: string
) {
  form.append("api_user", apiUser);
  form.append("api_secret", apiSecret);
  form.append("models", "genai,deepfake");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(SIGHTENGINE_SYNC_URL, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    const text = await res.text();
    let payload: any = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { _raw: text };
    }
    return { status: res.status, payload };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const { apiUser, apiSecret } = getCredentials();
  if (!apiUser || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Video detection is not configured yet. The site owner needs to add the Sightengine API credentials (SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET) in the hosting dashboard.",
        code: "DETECTION_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  try {
    // --- JSON body: direct video URL ---
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      const url = typeof body?.url === "string" ? body.url.trim() : "";
      if (!url || !/^https?:\/\//i.test(url)) {
        return NextResponse.json(
          { error: "A direct video URL (http/https) is required." },
          { status: 400 }
        );
      }
      const form = new FormData();
      form.append("url", url);
      const { status, payload } = await callSightengineSync(
        form,
        apiUser,
        apiSecret
      );
      if (status !== 200 || payload?.status !== "success") {
        return NextResponse.json(
          {
            error:
              payload?.error?.message ||
              payload?.error ||
              "The detection service could not analyse this video URL.",
            code: "DETECTION_FAILED",
            detail: payload,
          },
          { status: 502 }
        );
      }
      return NextResponse.json(normalizeResult(payload));
    }

    // --- Multipart body: uploaded video file ---
    const formData = await req.formData().catch(() => null);
    const file = formData?.get("media") ?? formData?.get("video") ?? formData?.get("file");
    if (!file || typeof file === "object" && !("arrayBuffer" in file)) {
      return NextResponse.json(
        { error: "Upload a video file to analyse." },
        { status: 400 }
      );
    }
    const videoFile = file as File;
    // Sightengine sync endpoint is for short clips; cap upload size to stay
    // inside Vercel + Sightengine limits.
    const MAX_BYTES = 50 * 1024 * 1024;
    if (videoFile.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error:
            "This video is larger than 50 MB. Please use a shorter clip (under 1 minute) for instant detection.",
        },
        { status: 413 }
      );
    }
    const form = new FormData();
    form.append("media", videoFile, videoFile.name || "video.mp4");
    const { status, payload } = await callSightengineSync(
      form,
      apiUser,
      apiSecret
    );
    if (status !== 200 || payload?.status !== "success") {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.error ||
            "The detection service could not analyse this video.",
          code: "DETECTION_FAILED",
          detail: payload,
        },
        { status: 502 }
      );
    }
    return NextResponse.json(normalizeResult(payload));
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "The analysis took too long. Please try a shorter clip (under 1 minute).",
          code: "DETECTION_TIMEOUT",
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Unable to analyse this video right now. Please try again." },
      { status: 500 }
    );
  }
}
