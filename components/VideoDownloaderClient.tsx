"use client";
// Standalone video downloader for https://www.aitext.tech/video-downloader
// Paste a social-media video link, get a direct download. Also the manual
// fallback for the AI video detector when a link cannot be fetched.

import React, { useState } from "react";
import Link from "next/link";
import {
  Link2,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  SearchCheck,
  ArrowRight,
} from "lucide-react";

interface PickerItem {
  url: string;
  type?: string;
  filename?: string;
}

export default function VideoDownloaderClient() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("video.mp4");
  const [service, setService] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerItem[]>([]);

  const handleDownload = async () => {
    const trimmed = link.trim();
    if (!trimmed) {
      setError("Paste a video link first.");
      return;
    }
    setError(null);
    setDownloadUrl(null);
    setPicker([]);
    setService(null);
    setLoading(true);
    try {
      const res = await fetch("/api/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            "This link could not be downloaded. Try another link, or use the app's own download option."
        );
      }
      if (data.status === "picker" && Array.isArray(data.items)) {
        setPicker(data.items);
        setService(data.service || null);
        return;
      }
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setFilename(data.filename || "video.mp4");
        setService(data.service || null);
        return;
      }
      throw new Error("The downloader could not return a file for this link.");
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            AIText
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Humanizer
            </Link>
            <Link href="/ai-video-detector" className="hover:text-slate-900">
              Video Detector
            </Link>
            <Link
              href="/video-downloader"
              className="text-slate-900 underline underline-offset-4"
            >
              Downloader
            </Link>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Free video downloader — Facebook, YouTube, TikTok &amp; Instagram
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Paste a video link and download the video — free, no sign-up, no
            watermark, no app to install. Use it for your own videos, or to
            save a clip so you can check it with our{" "}
            <Link
              href="/ai-video-detector"
              className="font-semibold text-slate-900 underline underline-offset-2"
            >
              AI video detector
            </Link>
            .
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="download-link"
            className="text-sm font-semibold text-slate-700"
          >
            Video link
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="download-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleDownload();
                }
              }}
              placeholder="Paste a Facebook, YouTube, TikTok or Instagram video link…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {loading ? "Fetching…" : "Get download link"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            YouTube links work most reliably. Facebook blocks most automated
            downloads, so some Facebook links cannot be fetched — in that case,
            use the video&apos;s own download option inside the Facebook app.
          </p>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          {downloadUrl && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Your video is ready
              </p>
              {service && (
                <p className="mt-1 text-xs text-slate-600">
                  Source: {service}
                </p>
              )}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={downloadUrl}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" /> Download video
                </a>
                <Link
                  href="/ai-video-detector"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <SearchCheck className="h-4 w-4" /> Check if this video is
                  AI-generated <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                If the download does not start, long-press the button (on
                mobile) or right-click it (on desktop) and choose “Save link
                as”.
              </p>
            </div>
          )}

          {picker.length > 0 && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold">
                This post has {picker.length} downloadable items:
              </p>
              <ul className="mt-3 space-y-2">
                {picker.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      download={item.filename || `video-${i + 1}.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:border-slate-400"
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                      Download {item.type || "video"} {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            How to download a video
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>Copy the link of the video from Facebook, YouTube, TikTok or Instagram.</li>
            <li>Paste it in the box above and tap “Get download link”.</li>
            <li>Tap “Download video” to save the file to your device.</li>
          </ol>
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            Only download videos you have the right to save — your own videos,
            or videos shared with permission. Downloading someone else&apos;s
            copyrighted content without permission may violate the
            platform&apos;s terms and local law.
          </p>
        </section>
      </div>
    </main>
  );
}
