import type { Metadata } from "next";
import VideoDownloaderClient from "@/components/VideoDownloaderClient";

export const metadata: Metadata = {
  title: "Free Video Downloader — Download Videos from Facebook, YouTube, TikTok & Instagram",
  description:
    "Paste a video link from Facebook, YouTube, TikTok or Instagram and download the video for free. No sign-up, no watermark, no app to install.",
  keywords: [
    "video downloader",
    "facebook video downloader",
    "youtube video downloader",
    "tiktok video downloader",
    "instagram video downloader",
    "download video from link",
    "free video downloader",
    "fb video download",
  ],
  alternates: {
    canonical: "https://www.aitext.tech/video-downloader",
  },
  openGraph: {
    type: "website",
    url: "https://www.aitext.tech/video-downloader",
    siteName: "AIText",
    title: "Free Video Downloader — Facebook, YouTube, TikTok & Instagram",
    description:
      "Paste a video link and download the video for free. No sign-up, no watermark, no app to install.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VideoDownloaderPage() {
  return <VideoDownloaderClient />;
}
