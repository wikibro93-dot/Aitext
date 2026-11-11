// AI Image Detector API route for https://www.aitext.tech
// Uses Sightengine's AI-generated image + deepfake detection models.
// Accepts an image file (multipart) or a direct image URL (JSON).
// Images are analysed synchronously, so results come back in one call.
import { NextRequest, NextResponse } from "next/server";

const SIGHTENGINE_CHECK_URL = "https://api.sightengine.com/1.0/check.json";
const UPSTREAM_TIMEOUT_MS = 30000;

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

function normalizeResult(payload: any) {
  const type = payload?.type ?? payload?.result?.type ?? {};
  const genai = type.genai ?? {};
  const deepfake = type.deepfake ?? {};

  // Image endpoint returns type.ai_generated / type.deepfake as plain
  // numbers; video endpoint nests them under type.genai / type.deepfake.
  const aiScore =
    toNumber(type.ai_generated) ??
    toNumber(genai.ai_generated) ??
    toNumber(genai.ai) ??
    toNumber(genai.score) ??
    toNumber(payload?.genai) ??
    null;

  const deepfakeScore =
    toNumber(type.deepfake) ??
    toNumber(deepfake.score) ??
    toNumber(deepfake.fake) ??
    toNumber(payload?.deepfake) ??
    null;

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

export async function POST(req: NextRequest) {
  const { apiUser, apiSecret } = getCredentials();
  if (!apiUser || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Image detection is not configured yet. The site owner needs to add the Sightengine API credentials (SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET) in the hosting dashboard.",
        code: "DETECTION_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    // --- JSON body: direct image URL ---
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      const url = typeof body?.url === "string" ? body.url.trim() : "";
      if (!url || !/^https?:\/\//i.test(url)) {
        return NextResponse.json(
          { error: "A direct image URL (http/https) is required." },
          { status: 400 }
        );
      }
      const params = new URLSearchParams({
        url,
        models: "genai,deepfake",
        api_user: apiUser,
        api_secret: apiSecret,
      });
      const res = await fetch(`${SIGHTENGINE_CHECK_URL}?${params}`, {
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload || payload?.status !== "success") {
        return NextResponse.json(
          {
            error:
              payload?.error?.message ||
              payload?.error ||
              "The detection service could not analyse this image URL.",
            code: "DETECTION_FAILED",
            detail: payload,
          },
          { status: 502 }
        );
      }
      return NextResponse.json(normalizeResult(payload));
    }

    // --- Multipart body: uploaded image file ---
    const formData = await req.formData().catch(() => null);
    const file = formData?.get("media") ?? formData?.get("image") ?? formData?.get("file");
    if (!file || typeof file === "object" && !("arrayBuffer" in file)) {
      return NextResponse.json(
        { error: "Upload an image file to analyse." },
        { status: 400 }
      );
    }
    const imageFile = file as File;
    const MAX_BYTES = 20 * 1024 * 1024;
    if (imageFile.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "This image is larger than 20 MB. Please use a smaller image." },
        { status: 413 }
      );
    }
    const form = new FormData();
    form.append("media", imageFile, imageFile.name || "image.jpg");
    form.append("models", "genai,deepfake");
    form.append("api_user", apiUser);
    form.append("api_secret", apiSecret);
    const res = await fetch(SIGHTENGINE_CHECK_URL, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload || payload?.status !== "success") {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.error ||
            "The detection service could not analyse this image.",
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
        { error: "The analysis took too long. Please try a smaller image.", code: "DETECTION_TIMEOUT" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Unable to analyse this image right now. Please try again." },
      { status: 500 }
    );
  } finally {
    clearTimeout(timer);
  }
}
