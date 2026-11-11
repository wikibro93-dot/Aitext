import type { Metadata } from "next";
import VideoDetectorClient from "@/components/VideoDetectorClient";

export const metadata: Metadata = {
  title: "Free AI Video Detector — Check If a Video Is AI-Generated or Fake",
  description:
    "Paste a Facebook, YouTube, TikTok or Instagram link, or upload a video, and check whether it was made by AI. Free AI video detector with an AI-likelihood score, deepfake check and per-generator breakdown.",
  keywords: [
    "ai video detector",
    "detect ai video",
    "fake video detector",
    "is this video ai generated",
    "ai generated video checker",
    "deepfake detector",
    "check fake video facebook",
    "ai video checker free",
    "sora video detector",
    "veo video detector",
  ],
  alternates: {
    canonical: "https://www.aitext.tech/ai-video-detector",
  },
  openGraph: {
    type: "website",
    url: "https://www.aitext.tech/ai-video-detector",
    siteName: "AIText",
    title: "Free AI Video Detector — Check If a Video Is AI-Generated or Fake",
    description:
      "Paste a Facebook, YouTube, TikTok or Instagram link, or upload a video, and check whether it was made by AI. Free, no sign-up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIVideoDetectorPage() {
  return <VideoDetectorClient />;
}
