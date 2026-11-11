import type { Metadata } from "next";
import VideoDetectorClient from "@/components/VideoDetectorClient";

export const metadata: Metadata = {
  title: "Free AI Video & Image Detector — Check If a Video or Photo Is AI-Generated or Fake",
  description:
    "Paste a Facebook, YouTube, TikTok or Instagram link, upload a video, or check an image, and find out whether it was made by AI. Free AI video and image detector with an AI-likelihood score, deepfake check and per-generator breakdown.",
  keywords: [
    "ai video detector",
    "ai image detector",
    "detect ai video",
    "detect ai image",
    "fake video detector",
    "fake image detector",
    "is this video ai generated",
    "is this image ai generated",
    "ai generated video checker",
    "ai generated image checker",
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
    title: "Free AI Video & Image Detector — Check If a Video or Photo Is AI-Generated or Fake",
    description:
      "Paste a Facebook, YouTube, TikTok or Instagram link, upload a video, or check an image, and find out whether it was made by AI. Free, no sign-up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIVideoDetectorPage() {
  return <VideoDetectorClient />;
}
