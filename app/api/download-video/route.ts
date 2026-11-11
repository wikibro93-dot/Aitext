// Video Downloader API route for https://www.aitext.tech
// Resolves a video link to a direct download URL.
// Layers (in order):
//   1. Direct video-file URLs (mp4/webm/mov/mkv) — returned as-is.
//   2. YouTube links — resolved with @distube/ytdl-core (pure JS, no binary).
//   3. Other platforms — attempted through a cobalt API instance
//      (COBALT_API_URL; the public instance now requires auth, so a
//      self-hosted instance is recommended for production).
// When a link cannot be resolved, the route returns DOWNLOAD_FAILED so the
// frontend can show the manual-download popup and the upload fallback.
import { NextRequest, NextResponse } from "next/server";
import { Ytdl, chooseFormat } from "@distube/ytdl-core";

const DIRECT_VIDEO_RE = /\.(mp4|webm|mov|mkv|m4v)(\?|#|$)/i;
const UPSTREAM_TIMEOUT_MS = 25000;

function isYouTube(host: string) {
  return host.includes("youtube.com") || host.includes("youtu.be");
}

function manualFallback(platform: string) {
  return {
    error:
      "This link could not be downloaded automatically. Download the video from the app, then upload the file here instead.",
    code: "DOWNLOAD_FAILED",
    platform,
  };
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    ),
  ]);
}

async function resolveYouTube(url: string) {
  // ytdl-core picks a combined audio+video format (mp4, h264) when possible.
  // Bound it tightly: YouTube often challenges datacenter IPs, and a hang
  // here must not stall the whole request.
  const ytdl = new Ytdl();
  const info = await withTimeout(ytdl.getInfo(url), 12000, "youtube");
  const format =
    chooseFormat(info.formats, {
      quality: "highest",
      filter: (f: any) => f.hasVideo && f.hasAudio && f.container === "mp4",
    }) || chooseFormat(info.formats, { quality: "highest" });
  if (!format?.url) return null;
  return {
    downloadUrl: format.url,
    filename: `${(info.videoDetails.title || "video")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .slice(0, 80) || "video"}.mp4`,
    service: "youtube",
  };
}

async function resolveViaCobalt(url: string) {
  const cobaltBase = (
    process.env.COBALT_API_URL?.trim() || "https://api.cobalt.tools"
  ).replace(/\/+$/, "");
  const endpoint = cobaltBase.endsWith("/api/json")
    ? cobaltBase
    : `${cobaltBase}/api/json`;
  // Newer cobalt instances use POST / (root); older use /api/json.
  // Try root first, then /api/json.
  const endpoints = [cobaltBase, endpoint];
  for (const ep of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          videoQuality: "720",
          downloadMode: "auto",
          filenameStyle: "basic",
          youtubeVideoCodec: "h264",
        }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const status = data.status;
        if (
          (status === "success" || status === "stream" || status === "redirect") &&
          data.url
        ) {
          return {
            downloadUrl: data.url,
            filename: data.filename || "video.mp4",
            service: data.service || null,
          };
        }
        if (status === "picker" && Array.isArray(data.picker)) {
          const items = data.picker
            .filter((p: any) => p?.url)
            .map((p: any) => ({
              url: p.url,
              type: p.type || "video",
              filename: p.filename || undefined,
            }));
          if (items.length > 0) return { picker: items, service: data.service || null };
        }
      }
    } catch {
      // Try the next endpoint.
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let url = "";
  try {
    const body = await req.json();
    url = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    url = "";
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "Paste a valid video link (starting with http:// or https://)." },
      { status: 400 }
    );
  }

  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  // Layer 1: direct video file.
  if (DIRECT_VIDEO_RE.test(url)) {
    return NextResponse.json({
      status: "success",
      downloadUrl: url,
      filename: url.split("/").pop()?.split("?")[0] || "video.mp4",
      service: "direct",
      platform: host,
    });
  }

  // Layer 2: YouTube.
  if (isYouTube(host)) {
    try {
      const resolved = await resolveYouTube(url);
      if (resolved) {
        return NextResponse.json({
          status: "success",
          ...resolved,
          platform: host,
        });
      }
    } catch {
      // Fall through to cobalt, then to the manual fallback.
    }
  }

  // Layer 3: cobalt (other platforms + YouTube fallback).
  try {
    const resolved = await resolveViaCobalt(url);
    if (resolved && "downloadUrl" in resolved) {
      return NextResponse.json({
        status: "success",
        ...resolved,
        platform: host,
      });
    }
    if (resolved && "picker" in resolved) {
      return NextResponse.json({
        status: "picker",
        items: resolved.picker,
        service: resolved.service || null,
        platform: host,
      });
    }
  } catch {
    // Fall through to the manual fallback.
  }

  return NextResponse.json(manualFallback(host), { status: 502 });
}
