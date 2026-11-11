"use client";
// AI Video Detector workbench for https://www.aitext.tech/ai-video-detector
// Paste a social-media link or upload a video file, and get an AI-likelihood
// score plus a deepfake check from the Sightengine detection models.

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Link2,
  Upload,
  ShieldCheck,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  Info,
  Video,
  Download,
  SearchCheck,
  FileVideo,
  ArrowRight,
  Image as ImageIcon,
  FileImage,
} from "lucide-react";

type Mode = "link" | "upload" | "image";

// Creem checkout URL for the $31/month AI Video Detector plan.
const VIDEO_PLAN_CHECKOUT_URL =
  "https://www.creem.io/product/prod_2zqIDCAqY2QN8u6YDJGOb6";

interface DetectResult {
  aiScore: number | null;
  deepfakeScore: number | null;
  generators: Record<string, number>;
  verdict: "likely_ai" | "likely_real" | "uncertain";
}

function pct(v: number | null): string {
  if (v === null || Number.isNaN(v)) return "—";
  return `${Math.round(v * 100)}%`;
}

function verdictCopy(v: DetectResult["verdict"], ai: number | null) {
  if (v === "likely_ai")
    return {
      title: "Likely AI-generated",
      tone: "text-rose-700 bg-rose-50 border-rose-200",
      body: `This video shows strong signs of AI generation (${pct(ai)} likelihood). Treat it as synthetic unless you can verify the original source.`,
    };
  if (v === "likely_real")
    return {
      title: "Likely a real video",
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      body: `This video shows few signs of AI generation (${pct(ai)} likelihood). It still pays to check the source before sharing.`,
    };
  return {
    title: "Unclear — check the source",
    tone: "text-amber-700 bg-amber-50 border-amber-200",
    body: "The signals are mixed, so no call can be made from the video alone. Check who posted it, look for the original, and compare with trusted sources.",
  };
}

export default function VideoDetectorClient() {
  const [mode, setMode] = useState<Mode>("link");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Paid video plan ($31/month) — license key from Creem. Image detection
  // stays free; only video detection requires a key.
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseActive, setLicenseActive] = useState(false);
  const [licenseExpiresAt, setLicenseExpiresAt] = useState<string | null>(null);
  const [licenseMsg, setLicenseMsg] = useState<string | null>(null);
  const [licenseChecking, setLicenseChecking] = useState(false);
  const [showLicenseBox, setShowLicenseBox] = useState(false);

  // On load, re-verify a stored key so a returning subscriber stays unlocked.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("aitext_video_license");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved?.key) return;
      setLicenseKey(saved.key);
      void verifyLicenseKey(saved.key, saved.instance_id || "");
    } catch {
      // Stored key is unreadable — user can paste it again.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a successful Creem checkout the buyer returns with
  // ?subscribed=1 — open the key box and tell them to paste the key
  // from their receipt email.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subscribed") === "1") {
        setShowLicenseBox(true);
        setLicenseMsg(
          "Payment complete! Paste the license key from your Creem receipt email below to unlock video detection."
        );
        params.delete("subscribed");
        const next =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState(null, "", next);
      }
    } catch {
      // Ignore URL parsing errors.
    }
  }, []);

  const verifyLicenseKey = async (key: string, instanceId: string) => {
    const normalized = key.trim().toUpperCase();
    if (!normalized) {
      setLicenseMsg("Paste your license key first.");
      return false;
    }
    setLicenseChecking(true);
    setLicenseMsg(null);
    try {
      const res = await fetch("/api/detect-video/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: normalized,
          instance_id: instanceId || undefined,
          instance_name: "aitext-video-detector",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.active) {
        setLicenseActive(false);
        setLicenseMsg(
          data?.error || "This license key could not be verified. Check the key and try again."
        );
        return false;
      }
      setLicenseActive(true);
      setLicenseExpiresAt(data.expiresAt || null);
      setLicenseMsg(
        data.expiresAt
          ? `License active — video detection unlocked until ${new Date(data.expiresAt).toLocaleDateString()}.`
          : "License active — video detection unlocked."
      );
      try {
        localStorage.setItem(
          "aitext_video_license",
          JSON.stringify({ key: normalized, instance_id: data.instance_id || instanceId || "" })
        );
      } catch {
        // Storage unavailable — key still works for this session.
      }
      setShowLicenseBox(false);
      return true;
    } catch {
      setLicenseMsg("Could not verify the license key right now. Please try again.");
      return false;
    } finally {
      setLicenseChecking(false);
    }
  };

  const removeLicenseKey = () => {
    try {
      localStorage.removeItem("aitext_video_license");
    } catch {
      // Ignore storage errors.
    }
    setLicenseKey("");
    setLicenseActive(false);
    setLicenseExpiresAt(null);
    setLicenseMsg(null);
  };

  const requireVideoAccess = () => {
    if (licenseActive) return true;
    setShowLicenseBox(true);
    setError(
      "Video detection is a paid feature ($31/month). Subscribe below, then paste your license key to unlock it. Image detection is free."
    );
    return false;
  };

  const resetOutcome = () => {
    setError(null);
    setResult(null);
  };

  const runDetectionOnUrl = async (directUrl: string) => {
    setStatus("Analysing the video… this usually takes a few seconds.");
    const res = await fetch("/api/detect-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: directUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error || "The detection service could not analyse this video."
      );
    }
    return data as DetectResult;
  };

  const runDetectionOnFile = async (f: File) => {
    setStatus("Uploading and analysing the video… this usually takes a few seconds.");
    const fd = new FormData();
    fd.append("media", f, f.name);
    const res = await fetch("/api/detect-video", {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error || "The detection service could not analyse this video."
      );
    }
    return data as DetectResult;
  };

  const handleCheckLink = async () => {
    if (!requireVideoAccess()) return;
    const trimmed = link.trim();
    if (!trimmed) {
      setError("Paste a video link first.");
      return;
    }
    resetOutcome();
    setLoading(true);
    try {
      // Step 1: resolve the social link to a direct video file.
      setStatus("Fetching the video from the link…");
      const dlRes = await fetch("/api/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const dl = await dlRes.json().catch(() => ({}));
      if (!dlRes.ok || !dl.downloadUrl) {
        // The link could not be fetched (Facebook blocks most automated
        // downloads). Show the manual-download popup instead of a dead end.
        setShowDownloadPopup(true);
        setError(
          "We could not fetch this video from the link. Download it and upload the file instead — the popup above shows how."
        );
        return;
      }
      // Step 2: analyse the resolved video file.
      const out = await runDetectionOnUrl(dl.downloadUrl);
      setResult(out);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const handleCheckFile = async () => {
    if (!requireVideoAccess()) return;
    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    resetOutcome();
    setLoading(true);
    try {
      const out = await runDetectionOnFile(file);
      setResult(out);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const runDetectionOnImageFile = async (f: File) => {
    setStatus("Uploading and analysing the image… this usually takes a few seconds.");
    const fd = new FormData();
    fd.append("media", f, f.name);
    const res = await fetch("/api/detect-image", {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error || "The detection service could not analyse this image."
      );
    }
    return data as DetectResult;
  };

  const runDetectionOnImageUrl = async (url: string) => {
    setStatus("Analysing the image… this usually takes a few seconds.");
    const res = await fetch("/api/detect-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error || "The detection service could not analyse this image."
      );
    }
    return data as DetectResult;
  };

  const handleCheckImage = async () => {
    resetOutcome();
    setLoading(true);
    try {
      const url = imageUrl.trim();
      if (imageFile) {
        const out = await runDetectionOnImageFile(imageFile);
        setResult(out);
      } else if (url) {
        const out = await runDetectionOnImageUrl(url);
        setResult(out);
      } else {
        setError("Choose an image file or paste an image link first.");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const onDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setImageFile(f);
      setImageUrl("");
      resetOutcome();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      resetOutcome();
    }
  };

  const generatorEntries = result
    ? Object.entries(result.generators).sort((a, b) => b[1] - a[1]).slice(0, 6)
    : [];
  const verdict = result ? verdictCopy(result.verdict, result.aiScore) : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            AIText
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Humanizer
            </Link>
            <Link
              href="/ai-video-detector"
              className="text-slate-900 underline underline-offset-4"
            >
              Video Detector
            </Link>
            <Link href="/video-downloader" className="hover:text-slate-900">
              Downloader
            </Link>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            AI Video &amp; Image Detector — check if a video or photo is
            AI-generated or fake
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Fake videos and photos spread fast on Facebook, YouTube, TikTok and
            Instagram. Paste a link, upload a video, or check an image and get
            an AI-likelihood score plus a deepfake check — free, no sign-up.
            Videos: best for clips under 1 minute (max 50&nbsp;MB). Images:
            JPG, PNG, WebP or GIF (max 20&nbsp;MB).
          </p>
        </div>

        {/* Workbench */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("link");
                resetOutcome();
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === "link"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Link2 className="h-4 w-4" /> Paste a link
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("upload");
                resetOutcome();
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === "upload"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Upload className="h-4 w-4" /> Upload a video
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("image");
                resetOutcome();
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === "image"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ImageIcon className="h-4 w-4" /> Check an image
            </button>
          </div>

          {/* Paid video plan — license key box (video only; images stay free) */}
          {(mode === "link" || mode === "upload") && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {licenseActive ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Video plan active
                    {licenseExpiresAt
                      ? ` · until ${new Date(licenseExpiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                  <button
                    type="button"
                    onClick={removeLicenseKey}
                    className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-900"
                  >
                    Remove key
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold">
                    Video detection — $31/month
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Video checks need a paid plan because the detection service
                    charges per video. Subscribe, then paste the license key
                    from your receipt email to unlock video detection. Image
                    detection is free.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={VIDEO_PLAN_CHECKOUT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Subscribe — $31/month
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowLicenseBox((v) => !v)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {showLicenseBox ? "Hide key entry" : "I already have a key"}
                    </button>
                  </div>
                  {showLicenseBox && (
                    <div className="mt-3">
                      <label
                        htmlFor="license-key"
                        className="text-xs font-semibold text-slate-700"
                      >
                        License key
                      </label>
                      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                        <input
                          id="license-key"
                          type="text"
                          value={licenseKey}
                          onChange={(e) => setLicenseKey(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void verifyLicenseKey(licenseKey, "");
                            }
                          }}
                          placeholder="Paste your license key…"
                          autoComplete="off"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => void verifyLicenseKey(licenseKey, "")}
                          disabled={licenseChecking}
                          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {licenseChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {licenseChecking ? "Verifying…" : "Verify & unlock"}
                        </button>
                      </div>
                      {licenseMsg && (
                        <p className="mt-2 text-xs text-slate-600">{licenseMsg}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        Lost your key? Find it in your Creem receipt email, or
                        contact support with the email you paid with.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === "link" ? (
            <div className="mt-5">
              <label
                htmlFor="video-link"
                className="text-sm font-semibold text-slate-700"
              >
                Video link
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="video-link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleCheckLink();
                    }
                  }}
                  placeholder="Paste a Facebook, YouTube, TikTok or Instagram video link…"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => void handleCheckLink()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchCheck className="h-4 w-4" />
                  )}
                  {loading ? "Checking…" : "Check video"}
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                We fetch the video from the link and analyse it. YouTube links
                usually work directly. Facebook blocks most automated downloads,
                so if a Facebook link cannot be fetched we will show you how to
                download it and upload the file instead.
              </p>
            </div>
          ) : mode === "upload" ? (
            <div className="mt-5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
                  dragOver
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400"
                }`}
              >
                <FileVideo className="h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold">
                  {file ? file.name : "Drop a video here, or click to choose one"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  MP4, MOV, WebM or MKV · under 1 minute · max 50&nbsp;MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      resetOutcome();
                    }
                  }}
                />
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => void handleCheckFile()}
                  disabled={loading}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchCheck className="h-4 w-4" />
                  )}
                  {loading ? "Checking…" : "Check this video"}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => imageInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    imageInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDropImage}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
                  dragOver
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400"
                }`}
              >
                <FileImage className="h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold">
                  {imageFile
                    ? imageFile.name
                    : "Drop an image here, or click to choose one"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG, WebP or GIF · max 20&nbsp;MB
                </p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      setImageUrl("");
                      resetOutcome();
                    }
                  }}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="image-link"
                  className="text-sm font-semibold text-slate-700"
                >
                  Or paste an image link
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="image-link"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) setImageFile(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleCheckImage();
                      }
                    }}
                    placeholder="Paste a direct image URL (https://…/photo.jpg)…"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
              {(imageFile || imageUrl.trim()) && (
                <button
                  type="button"
                  onClick={() => void handleCheckImage()}
                  disabled={loading}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchCheck className="h-4 w-4" />
                  )}
                  {loading ? "Checking…" : "Check this image"}
                </button>
              )}
            </div>
          )}

          {/* Status / error */}
          {status && (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" /> {status}
            </p>
          )}
          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          {/* Result */}
          {result && verdict && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${verdict.tone}`}
              >
                {result.verdict === "likely_ai" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : result.verdict === "likely_real" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                {verdict.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {verdict.body}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    AI-generated likelihood
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {pct(result.aiScore)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        (result.aiScore ?? 0) >= 0.7
                          ? "bg-rose-500"
                          : (result.aiScore ?? 0) <= 0.3
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.round((result.aiScore ?? 0) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    How strongly the video matches known AI generators (Sora,
                    Veo, Kling, Runway and others).
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Face manipulation (deepfake)
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {pct(result.deepfakeScore)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        (result.deepfakeScore ?? 0) >= 0.5
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.round((result.deepfakeScore ?? 0) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Whether faces in the video appear swapped or AI-modified.
                    Scores above 50% suggest manipulation.
                  </p>
                </div>
              </div>

              {generatorEntries.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Closest matching generators
                  </p>
                  <ul className="mt-2 space-y-2">
                    {generatorEntries.map(([name, score]) => (
                      <li key={name} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0 font-medium capitalize">
                          {name.replace(/_/g, " ")}
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <span
                            className="block h-full rounded-full bg-slate-700"
                            style={{ width: `${Math.round(score * 100)}%` }}
                          />
                        </span>
                        <span className="w-12 text-right font-semibold">
                          {pct(score)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-5 flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                No detector is definitive. Social-media compression can hide the
                traces detectors look for, and new generators appear constantly.
                Use this result together with the video&apos;s source — who posted
                it, whether a trusted outlet carries it, and whether the original
                exists — before deciding it is real or fake.
              </p>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            How the AI video detector works
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Video className="h-5 w-5 text-slate-700" />
              <h3 className="mt-3 font-semibold">1. Give us the video</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Paste a link from Facebook, YouTube, TikTok or Instagram, or
                upload the video file from your device.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <SearchCheck className="h-5 w-5 text-slate-700" />
              <h3 className="mt-3 font-semibold">2. We analyse the pixels</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                A trained detection model checks the video frames for the traces
                left by AI generators and face swaps — not the file name or
                metadata, which can be faked.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
              <h3 className="mt-3 font-semibold">3. You get a likelihood</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                You get an AI-likelihood score and a deepfake score, with the
                closest matching generators. It is a signal, not a verdict —
                always check the source too.
              </p>
            </div>
          </div>
        </section>

        {/* Honest limits */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            What it can and cannot do
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Detects videos made by the major generators — Sora, Veo, Kling,
              Runway, Midjourney, Pika and more — and face swaps.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Works from a link or an upload, so Facebook, YouTube, TikTok and
              Instagram videos can all be checked.
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              It is not proof. Heavy compression on social media strips the
              traces detectors rely on, so a real-looking result is never a
              guarantee.
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              New generators appear constantly. A detector can lag behind the
              newest models for weeks.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Need the video file first? Use our{" "}
            <Link
              href="/video-downloader"
              className="font-semibold text-slate-900 underline underline-offset-2"
            >
              free video downloader
            </Link>{" "}
            to save a video from a link, then upload it here.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold">
                Can I check a Facebook video with a link?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Yes — paste the Facebook link and we try to fetch the video
                automatically. Facebook blocks most automated downloads, so if
                the link cannot be fetched we will show you how to download the
                video and upload the file instead. Upload always works.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">
                Is the AI video detector free?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Yes. There is no sign-up and no account. For instant results,
                use clips under 1 minute and under 50&nbsp;MB.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">
                Is a high AI score proof a video is fake?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                No. It is a likelihood based on traces left by generators.
                Compression, editing and re-uploads can hide those traces, and
                detectors can be wrong. Always verify the source before
                believing or sharing a video.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Manual-download popup */}
      {showDownloadPopup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setShowDownloadPopup(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold">
                This link could not be fetched automatically
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowDownloadPopup(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Facebook and some other apps block automatic downloads. You can
              still check this video — download it first, then upload the file
              here.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              <li>
                Open the video in the Facebook app (or on facebook.com) and tap
                the three dots on the video, then choose{" "}
                <strong>Save video</strong> / <strong>Download</strong>. If
                there is no download option, use our{" "}
                <Link
                  href="/video-downloader"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => setShowDownloadPopup(false)}
                >
                  free video downloader
                </Link>{" "}
                — paste the same link there and save the file.
              </li>
              <li>Come back here and switch to the Upload tab.</li>
              <li>Choose the downloaded video file and tap Check video.</li>
            </ol>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDownloadPopup(false);
                  setMode("upload");
                  resetOutcome();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" /> Upload the video
              </button>
              <Link
                href="/video-downloader"
                onClick={() => setShowDownloadPopup(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> Open downloader
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
