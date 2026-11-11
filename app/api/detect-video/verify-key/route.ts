// License-key verification for the paid AI Video Detector plan.
// Validates a Creem license key directly against Creem's License API
// (no database needed): activate on first use, validate on later uses.
// The key is issued by Creem when a user buys the $31/month video plan.
import { NextRequest, NextResponse } from "next/server";

const CREEM_API_BASE = "https://api.creem.io";
const UPSTREAM_TIMEOUT_MS = 15000;

function getCreemKey() {
  return process.env.CREEM_API_KEY?.trim() || "";
}

async function creemPost(path: string, body: Record<string, unknown>) {
  const apiKey = getCreemKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(`${CREEM_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const apiKey = getCreemKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "License verification is not configured yet. The site owner needs to add the Creem API key (CREEM_API_KEY) in the hosting dashboard.",
        code: "LICENSE_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let key = "";
  let instanceId = "";
  let instanceName = "";
  try {
    const body = await req.json();
    key = typeof body?.key === "string" ? body.key.trim().toUpperCase() : "";
    instanceId = typeof body?.instance_id === "string" ? body.instance_id.trim() : "";
    instanceName = typeof body?.instance_name === "string" ? body.instance_name.trim() : "aitext-video-detector";
  } catch {
    key = "";
  }

  if (!key) {
    return NextResponse.json(
      { error: "Paste your license key to unlock video detection." },
      { status: 400 }
    );
  }

  try {
    // If we already have an instance id, validate it. Otherwise activate
    // the key for this device (creates the instance).
    if (instanceId) {
      const { status, data } = await creemPost("/v1/licenses/validate", {
        key,
        instance_id: instanceId,
      });
      if (status === 200 && data && (data.valid === true || data.status === "active" || data.status === "valid")) {
        return NextResponse.json({
          ok: true,
          active: true,
          instance_id: instanceId,
          expiresAt: data.expires_at || data.expiresAt || null,
        });
      }
      // Validation failed (expired, revoked, cancelled) — fall through to
      // a fresh activation attempt so a renewed key can re-activate.
      if (status === 410 || status === 404 || status === 403) {
        return NextResponse.json(
          {
            ok: false,
            active: false,
            error:
              "This license key is no longer active. It may have expired, been refunded, or the subscription was cancelled.",
            code: "LICENSE_INACTIVE",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          ok: false,
          active: false,
          error: "Could not verify this license key. Please try again.",
          code: "LICENSE_CHECK_FAILED",
        },
        { status: 502 }
      );
    }

    const { status, data } = await creemPost("/v1/licenses/activate", {
      key,
      instance_name: instanceName,
    });
    if (status === 200 && data) {
      const newInstanceId =
        data.instance_id || data.instanceId || data.id || null;
      return NextResponse.json({
        ok: true,
        active: true,
        instance_id: newInstanceId,
        expiresAt: data.expires_at || data.expiresAt || null,
      });
    }
    if (status === 404) {
      return NextResponse.json(
        {
          ok: false,
          active: false,
          error: "This license key is not recognised. Check the key and try again.",
          code: "LICENSE_INVALID",
        },
        { status: 404 }
      );
    }
    if (status === 403) {
      return NextResponse.json(
        {
          ok: false,
          active: false,
          error:
            "This license key has reached its activation limit. Deactivate it on another device first, or contact support.",
          code: "LICENSE_LIMIT",
        },
        { status: 403 }
      );
    }
    if (status === 410) {
      return NextResponse.json(
        {
          ok: false,
          active: false,
          error:
            "This license key is no longer active. It may have expired, been refunded, or the subscription was cancelled.",
          code: "LICENSE_INACTIVE",
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        active: false,
        error: "Could not verify this license key. Please try again.",
        code: "LICENSE_CHECK_FAILED",
      },
      { status: 502 }
    );
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json(
        { error: "License verification timed out. Please try again.", code: "LICENSE_TIMEOUT" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Could not verify this license key right now. Please try again." },
      { status: 500 }
    );
  }
}
