"use client";
// Main Workbench for AIText (https://www.aitext.tech)

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  Flame, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  HelpCircle, 
  ArrowRight, 
  Columns, 
  Layout, 
  FileText, 
  PenTool, 
  MessageSquare,
  Compass, 
  Briefcase, 
  Heart,
  Shuffle,
  X,
  Mail,
  ShieldCheck,
  Info,
  Share2,
  ExternalLink,
  Send,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  analyzeTextReadability, 
  AI_BUZZWORDS, 
  ReadabilityMetrics 
} from "@/lib/readability";
import { BLOG_POSTS } from "@/lib/blog-data";
import { PillarArticle } from "@/components/PillarArticle";

// Samples mapping
const SAMPLES = [
  {
    id: "tech-cliché",
    label: "Tech & AI Cliché Draft",
    category: "Academic / Technical",
    text: "In the rapidly evolving landscape of modern technology, it is crucial to delve into how machine learning interfaces operate. Moreover, these systems are not only revolutionary but also serve as a profound testament to human ingenuity. By exploring the multifaceted dimensions of AI, we can build a brighter future. In conclusion, it is important to note that these tools will foster connection across ecosystems."
  },
  {
    id: "marketing-buzz",
    label: "Corporate Marketing Pitch",
    category: "Business Copy",
    text: "Furthermore, we must synchronize our paradigms to elevate customer journeys. It is worth noting that our state-of-the-art framework is a game-changer that will revolutionize business landscapes. This is because we foster pivotal connections through an elevated ecosystem. Grounded in a holistic roadmap, each touchpoint serves as a testament to our customer-obsessed focus."
  },
  {
    id: "dry-manual",
    label: "Dry Explanatory Material",
    category: "General Prose",
    text: "Photosynthesis is a biological process of paramount importance in the natural world. Starch synthesis occurs within the chloroplast of the leaf structure. Furthermore, the role of sunlight is critical in securing high glucose yields. It is crucial to acknowledge that various ambient stressors affect vegetative efficacy. Moreover, research facilitates the demystifying of complex molecular operations."
  }
];

// Tone definitions
const TONES = [
  {
    id: "casual",
    label: "Casual Coffee Chat",
    description: "Relaxed & warm, uses contractions and friendly phrasing like talking to a friend.",
    icon: MessageSquare,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "storyteller",
    label: "Vivid Storyteller",
    description: "Narrative, rhythmic style using active imagery to pull the reader in.",
    icon: Compass,
    accent: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "professional",
    label: "Polished Expert",
    description: "Credible and clean, yet highly engaging and easy for non-specialists to digest.",
    icon: Briefcase,
    accent: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: "academic_simplified",
    label: "The Explainer",
    description: "Converts hyper-technical jargon into simple, beautifully logic-fluent prose.",
    icon: BookOpen,
    accent: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: "creative",
    label: "Punchy & Witty",
    description: "Highly varied sentence lengths, bold metaphors, and sparkling rhythm.",
    icon: PenTool,
    accent: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: "empathetic",
    label: "Warm & Empathetic",
    description: "Supportive and deeply human, prioritizing emotional comfort and validation.",
    icon: Heart,
    accent: "bg-rose-50 text-rose-700 border-rose-200"
  }
];

interface RewriteResult {
  humanizedText: string;
  readabilityExplanation: string;
  roboticPhrasesRemoved: { original: string; replacedWith: string; reason: string }[];
  sentenceLengthVarianceScore: string;
  flowScoreBefore: number;
  flowScoreAfter: number;
}

export default function HumanizerPage() {
  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResult | null>(null);
  
  // UI View configurations
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<"humanized" | "compare" | "corrections">("humanized");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms" | "cookies" | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Real-time stats calculated via useMemo to avoid re-renders
  const realTimeMetrics: ReadabilityMetrics = useMemo(() => {
    return analyzeTextReadability(inputText);
  }, [inputText]);

  // Load sample template text helper
  const handleLoadSample = (text: string) => {
    setInputText(text);
    setResult(null); // Clear previous results to encourage processing the new draft
    setError(null);
  };

  // Perform API request to server-side Gemini
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please paste or type some robotic content first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message = errorData.error || `Server responded with state ${response.status}`;
        if (typeof message === "string" && (message.includes("503") || message.includes("demand") || message.includes("UNAVAILABLE"))) {
          message = "Google's AI model servers are currently experiencing temporary high demand. Please click 'Try Again' in a few moments.";
        }
        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);
      setActiveOutputTab("humanized"); // Default to showing result first
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An unexpected error occurred while humanizing the text.";
      if (typeof msg === "string" && (msg.includes("503") || msg.includes("demand") || msg.includes("UNAVAILABLE"))) {
        msg = "Google's AI model servers are currently experiencing temporary high demand. Please click 'Try Again' in a few moments.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick clipboard utilities
  const copyToClipboard = (text: string, isOutput: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOutput) {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } else {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    }
  };

  // Web Share API handler with seamless fallback
  const handleShare = async () => {
    if (!result?.humanizedText) return;

    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://www.aitext.tech";
    const shareTitle = "Humanized Prose by AIText";
    const textToShare = result.humanizedText;

    // Check if Web Share API is available in browser
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const payload: ShareData = {
          title: shareTitle,
          text: textToShare,
          url: currentUrl,
        };

        if (!navigator.canShare || navigator.canShare(payload)) {
          await navigator.share(payload);
          setShareFeedback("Shared!");
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        } else {
          const textOnlyPayload: ShareData = {
            title: shareTitle,
            text: textToShare,
          };
          if (!navigator.canShare || navigator.canShare(textOnlyPayload)) {
            await navigator.share(textOnlyPayload);
            setShareFeedback("Shared!");
            setTimeout(() => setShareFeedback(null), 3000);
            return;
          }
        }
      } catch (err: any) {
        // AbortError is user cancellation, harmless
        if (err?.name === "AbortError") {
          return;
        }
        console.warn("Web Share API encountered an error, activating share options:", err);
      }
    }

    // Fallback if Web Share API is unavailable or rejected
    setShowShareMenu((prev) => !prev);
  };

  // Helper score color gauge
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 65) return "text-teal-600 border-teal-200 bg-teal-50";
    if (score >= 45) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-500 border-red-200 bg-red-50";
  };

  const scrollToWorkbench = () => {
    const el = document.getElementById("humanizer_workbench");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToArticle = () => {
    const el = document.getElementById("seo_pillar_article");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden" id="humanizer_app_root">
      {/* Decorative Warm Top Line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500" />

      {/* Modern SaaS Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 sm:gap-4">
            {/* Logo Brand */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="p-1.5 rounded-md bg-indigo-600 text-white shadow-xs flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                <PenTool className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-display font-bold tracking-tight text-slate-900 leading-none">
                  AIText
                </span>
                <span className="text-[10px] font-mono select-none px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100/80 rounded font-semibold leading-none">
                  .tech
                </span>
              </div>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-4 lg:gap-5">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Humanizer Workbench
              </span>
              <button 
                onClick={scrollToArticle}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Editorial Guide
              </button>
              <Link
                href="/blog"
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                Writing Guides
              </Link>
              <Link
                href="/ai-video-detector"
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                AI Video Detector
              </Link>
              <Link
                href="/video-downloader"
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                Video Downloader
              </Link>
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                How it Works
              </button>
              <button 
                onClick={() => {
                  handleLoadSample(SAMPLES[0].text);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Interactive Drafts
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <Link
                href="/blog"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-all flex items-center gap-1 md:hidden"
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Guides
              </Link>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-all flex items-center gap-1"
                id="how_it_works_btn"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">How it Works</span>
                <span className="sm:hidden">Help</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Hero Header Block */}
      <header className="bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-200/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-slate-900">
              Transform AI Drafts into <span className="text-indigo-600 font-semibold underline decoration-indigo-200 decoration-wavy">Engaging Human Prose</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Experience zero-compromise humanization. Our engine parses stiff AI structures, removes monotone descriptors, and injects customized natural sentence length rhythms in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleLoadSample(SAMPLES[0].text)}
              className="px-4 py-2 text-xs font-medium text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg transition-all flex items-center gap-1.5 border border-indigo-150"
              id="top_load_sample_btn"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Load Standard Sample
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Core Quick Sample Selector bar */}
        <section className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs" id="template_picker_section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Or selection from typical robotic drafts to test immediately:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLoadSample(s.text)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    inputText === s.text
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {s.label}
                  <span className="ml-1.5 text-[9px] opacity-70 font-mono font-normal">
                    ({s.category})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Splitting */}
        <div id="humanizer_workbench" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Input & Real-time Client-side metrics) - 7 span */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              {/* Box Header */}
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-500">
                    Draft Input Workspace
                  </h3>
                </div>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText("");
                      setResult(null);
                      setError(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset canvas
                  </button>
                )}
              </div>

              {/* Text Input area */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your robotic, AI-generated, or dry prose draft here... (e.g., loaded with clichés like 'delve', 'moreover', 'tapestry')."
                  className="w-full h-80 px-5 py-4 text-sm text-slate-700 bg-white placeholder-slate-400 border-none focus:outline-hidden focus:ring-0 resize-none font-sans leading-relaxed"
                  id="draft_textarea"
                />
                
                {/* Float helper */}
                {inputText.length === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center flex flex-col items-center max-w-sm px-4">
                    <PenTool className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                    <p className="mt-2.5 text-xs text-slate-400">
                      Empty Slate. Use a preset draft above, or write your own text to initiate real-time analysis logs.
                    </p>
                  </div>
                )}
              </div>

              {/* Real-time stats ticker bar */}
              <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap gap-5 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-800">{realTimeMetrics.wordCount}</span>
                    <span>words</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-800">{realTimeMetrics.characterCount}</span>
                    <span>chars</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-800">{realTimeMetrics.avgSentenceLength}</span>
                    <span>word avg/sentence</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-800">{realTimeMetrics.estimatedReadingTimeSec}s</span>
                    <span>read time</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Typing Quality Rate:</span>
                  <div className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${realTimeMetrics.readingEaseColor}`}>
                    {realTimeMetrics.readingEaseCategory} ({realTimeMetrics.fleschEaseScore})
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time cliché check box */}
            <AnimatePresence mode="popLayout">
              {inputText.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
                  id="cliche_alerts_container"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Stiff / Robotic Indicators Detected ({realTimeMetrics.detectedBuzzwords.length})</span>
                    </div>
                    {realTimeMetrics.detectedBuzzwords.length > 0 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                        Pruning Required
                      </span>
                    )}
                  </div>

                  {realTimeMetrics.detectedBuzzwords.length === 0 ? (
                    <div className="py-2 flex items-center gap-3 text-emerald-600 text-xs">
                      <CheckCircle className="h-4 w-4" />
                      <span>Excellent! No common AI clichés found in current typing. Flows beautifully.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 mt-1">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        These expressions are heavily preferred by AI pattern algorithms. Humanizing will replace or prune these:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {realTimeMetrics.detectedBuzzwords.map((b) => (
                          <div 
                            key={b.buzzword}
                            className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2.5"
                          >
                            <span className="text-xs font-mono font-medium text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm shrink-0">
                              {b.buzzword}
                            </span>
                            <div className="text-[11px] text-slate-600 leading-tight">
                              <span className="font-medium text-slate-700">x{b.count} count:</span> {b.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Core Editor Guidelines Card */}
            <div className="bg-slate-900 text-slate-300 rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#94a3b8] font-bold">
                  The Professional Rulebook We Enforce
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Text Humanizer pipeline strictly adheres to the standards of veteran human developmental editors:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-1">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">1. Structure Variety</div>
                  <p className="text-[11px] text-slate-400 leading-normal">Mix tiny punchy remarks with moderate detailed thoughts. Destroy monotonous reading patterns.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">2. Cliché Purging</div>
                  <p className="text-[11px] text-slate-400 leading-normal">Purge synthetic keywords like &ldquo;delve&rdquo;, &ldquo;tapestry&rdquo;, and clunky connectors like &ldquo;moreover&rdquo;.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">3. Natural Transitions</div>
                  <p className="text-[11px] text-slate-400 leading-normal">Improve narrative flow by transitioning content logically through human context rather than essay tags.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Adjustment presets, Humanize actions, and Humanized results) - 5 span */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="settings_and_actions">
            
            {/* Presets Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 text-slate-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500">
                    Configuration Center
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Tone Adjustments</span>
              </div>

              {/* Presets Selection Grid */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Rewrite Target Tone:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                  {TONES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedTone === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTone(t.id);
                          // Clear previous output so user is directed to process the new tone explicitly
                        }}
                        className={`p-3.5 rounded-xl text-left border transition-all flex gap-3 ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                        id={`tone_preset_${t.id}`}
                      >
                        <span className={`p-2 rounded-lg shrink-0 flex items-center justify-center border h-10 w-10 ${
                          isSelected ? t.accent : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {t.label}
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                            {t.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button Container */}
              <div className="mt-2 border-t border-slate-100 pt-4 flex flex-col gap-3">
                <button
                  onClick={handleHumanize}
                  disabled={loading || !inputText.trim()}
                  className={`w-full py-3.5 rounded-xl font-medium text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                    loading || !inputText.trim()
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white active:scale-98"
                  }`}
                  id="process_humanize_btn"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Reviewing and writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Humanize Text & Score Flow</span>
                    </>
                  )}
                </button>
                {error && (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-snug flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">{error}</div>
                    </div>
                    <button
                      onClick={handleHumanize}
                      disabled={loading}
                      className="self-end px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Humanized Output Area */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-xl border border-indigo-150 shadow-md overflow-hidden flex flex-col"
                  id="humanized_results_panel"
                >
                  {/* Output Header with comparative badges */}
                  <div className="bg-indigo-900 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <h3 className="text-xs uppercase font-mono tracking-wider font-semibold">
                        Expert Editor Output
                      </h3>
                    </div>
                    
                    {/* Scores layout */}
                    <div className="flex items-center gap-3">
                      <div className="text-center bg-indigo-950/50 rounded-lg px-2.5 py-1 border border-indigo-800">
                        <div className="text-[9px] text-indigo-300 font-mono tracking-wider uppercase">Original Flow</div>
                        <div className="text-sm font-bold text-slate-300 font-mono">{result.flowScoreBefore}/100</div>
                      </div>
                      <div className="flex items-center text-indigo-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <div className="text-center bg-emerald-950/40 rounded-lg px-2.5 py-1 border border-emerald-800">
                        <div className="text-[9px] text-emerald-300 font-mono tracking-wider uppercase">Humanized Flow</div>
                        <div className="text-sm font-bold text-emerald-400 font-mono">{result.flowScoreAfter}/100</div>
                      </div>
                    </div>
                  </div>

                  {/* Quality feedback banner */}
                  <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex items-start gap-3">
                    <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 text-xs font-mono font-bold">
                      {result.sentenceLengthVarianceScore}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Editor rationale: </span>
                      {result.readabilityExplanation}
                    </p>
                  </div>

                  {/* Tabs Control */}
                  <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => setActiveOutputTab("humanized")}
                      className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                        activeOutputTab === "humanized"
                          ? "border-indigo-600 text-indigo-700 bg-white"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Humanized Draft
                    </button>
                    <button
                      onClick={() => setActiveOutputTab("compare")}
                      className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                        activeOutputTab === "compare"
                          ? "border-indigo-600 text-indigo-700 bg-white"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Visual Comparison
                    </button>
                    <button
                      onClick={() => setActiveOutputTab("corrections")}
                      className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                        activeOutputTab === "corrections"
                          ? "border-indigo-600 text-indigo-700 bg-white"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Stiff Phrases Purged ({result.roboticPhrasesRemoved.length})
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-5 bg-white min-h-[260px] flex flex-col justify-between">
                    <div>
                      {activeOutputTab === "humanized" && (
                        <div className="text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap select-all">
                          {result.humanizedText}
                        </div>
                      )}

                      {activeOutputTab === "compare" && (
                        <div className="flex flex-col gap-4">
                          <div className="p-3 bg-red-50/30 border border-red-100 rounded-lg">
                            <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-red-600/80 mb-1 flex items-center gap-1.5">
                              <span>Stiff Original Input</span>
                              <span className="px-1.5 py-0.5 rounded-sm bg-red-100 border border-red-200 text-red-700 text-[8px] tracking-normal font-sans font-normal normal-case">Flow Score: {result.flowScoreBefore}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed line-through decoration-slate-300">
                              {inputText}
                            </p>
                          </div>

                          <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-lg">
                            <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-700 mb-1 flex items-center gap-1.5">
                              <span>Polished Expert Rewrite</span>
                              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8px] tracking-normal font-sans font-normal normal-case">Flow Score: {result.flowScoreAfter}</span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {result.humanizedText}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeOutputTab === "corrections" && (
                        <div className="flex flex-col gap-3">
                          {result.roboticPhrasesRemoved.length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center">
                              No standard AI clichés detected in the input, but standard sentence variance, timing, and flows have been beautifully streamlined!
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                              {result.roboticPhrasesRemoved.map((correction, idx) => (
                                <div 
                                  key={idx} 
                                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs flex flex-col gap-1.5"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="line-through text-red-500 font-mono px-1.5 py-0.5 bg-red-50 border border-red-100 rounded-sm">
                                      {correction.original}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-slate-400" />
                                    <span className="text-emerald-700 font-mono px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-sm font-bold">
                                      {correction.replacedWith}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-500 italic leading-snug">
                                    <span className="font-semibold text-slate-600 not-italic">Why: </span>
                                    {correction.reason}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Bar: Share & Copy Actions */}
                    <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-[11px] font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Ready to export
                        </span>
                        {shareFeedback && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs font-semibold text-emerald-600 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {shareFeedback}
                          </motion.span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 relative">
                        {/* Share Button (Web Share API) */}
                        <div className="relative">
                          <button
                            onClick={handleShare}
                            id="share_prose_btn"
                            title="Share humanized text via Web Share API or messaging apps"
                            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all border cursor-pointer ${
                              showShareMenu
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs"
                                : "bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <Share2 className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Share Prose</span>
                          </button>

                          {/* Fallback / Direct Share Dropdown Menu */}
                          <AnimatePresence>
                            {showShareMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 flex flex-col gap-1 text-xs"
                              >
                                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                                  <span>Share via App</span>
                                  <button
                                    onClick={() => setShowShareMenu(false)}
                                    className="hover:text-slate-700 text-slate-400 p-0.5 cursor-pointer"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* WhatsApp */}
                                <a
                                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                    `Check out this humanized prose from AIText:\n\n"${result.humanizedText}"\n\nRewrite your drafts at: https://www.aitext.tech`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowShareMenu(false)}
                                  className="px-2.5 py-2 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors flex items-center justify-between group"
                                >
                                  <span className="flex items-center gap-2 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    WhatsApp
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600" />
                                </a>

                                {/* X / Twitter */}
                                <a
                                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                    result.humanizedText.length > 200
                                      ? result.humanizedText.slice(0, 197) + "..."
                                      : result.humanizedText
                                  )}&url=https%3A%2F%2Fwww.aitext.tech`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowShareMenu(false)}
                                  className="px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between group"
                                >
                                  <span className="flex items-center gap-2 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                                    X (Twitter)
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-900" />
                                </a>

                                {/* Email */}
                                <a
                                  href={`mailto:?subject=${encodeURIComponent(
                                    "Humanized Prose from AIText"
                                  )}&body=${encodeURIComponent(
                                    `${result.humanizedText}\n\nGenerated with AIText (https://www.aitext.tech)`
                                  )}`}
                                  onClick={() => setShowShareMenu(false)}
                                  className="px-2.5 py-2 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 transition-colors flex items-center justify-between group"
                                >
                                  <span className="flex items-center gap-2 font-medium">
                                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                                    Email Client
                                  </span>
                                  <Send className="h-3 w-3 text-slate-400 group-hover:text-indigo-600" />
                                </a>

                                {/* Copy Shareable snippet */}
                                <button
                                  onClick={() => {
                                    copyToClipboard(
                                      `"${result.humanizedText}"\n\n— Humanized with https://www.aitext.tech`,
                                      true
                                    );
                                    setShowShareMenu(false);
                                  }}
                                  className="px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-between border-t border-slate-100 mt-0.5 text-left font-medium cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    Copy with Attribution
                                  </span>
                                  <span className="text-[10px] text-slate-400">text + link</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Copy Button */}
                        <button
                          onClick={() => copyToClipboard(result.humanizedText, true)}
                          id="copy_rewritten_prose_btn"
                          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                            copiedOutput 
                              ? "bg-emerald-600 text-white" 
                              : "bg-slate-900 text-white hover:bg-slate-800 active:scale-98"
                          }`}
                        >
                          {copiedOutput ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Rewritten Prose</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Comprehensive SEO Pillar Article & Technical Guide */}
        <PillarArticle 
          onScrollToWorkbench={scrollToWorkbench}
          onSelectTone={(toneId) => {
            setSelectedTone(toneId);
            scrollToWorkbench();
          }}
          onLoadSample={(text) => {
            handleLoadSample(text);
            scrollToWorkbench();
          }}
        />

          {/* Editorial Writing & SEO Guides Section */}
          <section id="writing_guides_section" className="mt-14 pt-10 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold mb-2">
                  <BookOpen className="h-3 w-3" />
                  Authentic Writing Guides
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-slate-900">
                  Master Natural Cadence & Overcome Robotic Patterns
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Human-crafted editorial lessons to help you understand burstiness, sentence rhythm, and why AI text sounds predictable.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors shrink-0"
              >
                Browse All Guides
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mt-2 leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">{post.readTime}</span>
                    <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
      </main>

      {/* Rich SaaS Footer */}
      <footer className="border-t border-slate-200/80 bg-white pt-16 pb-8 mt-16 text-slate-500 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
            {/* Column 1: Brand details */}
            <div className="md:col-span-4 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-600 text-white flex items-center justify-center">
                  <PenTool className="h-4 w-4" />
                </span>
                <span className="text-sm font-display font-semibold tracking-tight text-slate-800">
                  AIText Humanizer
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  aitext.tech
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                An advanced natural language workbench built for authors, content professionals, and researchers to restore natural conversational flow to robotic drafts.
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero text logging. Complete privacy.</span>
              </div>
            </div>

            {/* Column 2: Preset tones checklist */}
            <div className="md:col-span-2 flex flex-col gap-3 text-left">
              <h5 className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-800">
                Rewrite Tones
              </h5>
              <div className="flex flex-col gap-2 text-xs">
                <button 
                  onClick={() => setSelectedTone("casual")}
                  className={`text-left hover:text-indigo-650 transition-colors cursor-pointer ${selectedTone === "casual" ? "text-indigo-600 font-semibold" : "text-slate-400"}`}
                >
                  Casual Coffee Chat
                </button>
                <button 
                  onClick={() => setSelectedTone("storyteller")}
                  className={`text-left hover:text-indigo-650 transition-colors cursor-pointer ${selectedTone === "storyteller" ? "text-indigo-600 font-semibold" : "text-slate-400"}`}
                >
                  Vivid Storyteller
                </button>
                <button 
                  onClick={() => setSelectedTone("professional")}
                  className={`text-left hover:text-indigo-650 transition-colors cursor-pointer ${selectedTone === "professional" ? "text-indigo-600 font-semibold" : "text-slate-400"}`}
                >
                  Polished Expert
                </button>
                <button 
                  onClick={() => setSelectedTone("creative")}
                  className={`text-left hover:text-indigo-650 transition-colors cursor-pointer ${selectedTone === "creative" ? "text-indigo-600 font-semibold" : "text-slate-400"}`}
                >
                  Punchy & Witty
                </button>
              </div>
            </div>

            {/* Column 3: Resources links */}
            <div className="md:col-span-3 flex flex-col gap-3 text-left">
              <h5 className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-800">
                Writing Guides & Articles
              </h5>
              <ul className="flex flex-col gap-2 text-xs text-slate-400">
                <li>
                  <Link 
                    href="/blog/why-ai-text-sounds-robotic"
                    className="hover:text-indigo-600 transition-colors text-left"
                  >
                    Why AI Text Sounds Robotic
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog/words-ai-always-overuses"
                    className="hover:text-indigo-600 transition-colors text-left"
                  >
                    15 Words AI Overuses & Fixes
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog/sentence-burstiness-readability-guide"
                    className="hover:text-indigo-600 transition-colors text-left"
                  >
                    Sentence Burstiness & Cadence
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog/how-to-humanize-ai-content"
                    className="hover:text-indigo-600 transition-colors text-left"
                  >
                    How to Humanize AI Content
                  </Link>
                </li>
                <li className="pt-1">
                  <Link 
                    href="/blog" 
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    Explore All Editorial Guides &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Interactive newsletter subscription form */}
            <div className="md:col-span-3 flex flex-col gap-3 text-left">
              <h5 className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-800">
                The Weekly Prose Circular
              </h5>
              <p className="text-xs text-slate-400 leading-normal">
                Receive top editorial lessons, sentence variety checklists, and anti-cliché updates straight to your inbox.
              </p>
              
              <AnimatePresence mode="wait">
                {!newsletterSubscribed ? (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail.trim().includes("@")) {
                        setNewsletterSubscribed(true);
                      }
                    }}
                    className="flex mt-1 gap-1.5"
                  >
                    <input
                      required
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="editor@yourdomain.com"
                      className="flex-1 px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      Join
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Welcome to the circle! Verification sent.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} aitext.tech. All rights reserved. Free AI text humanizer & natural prose editor.
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
              <button 
                onClick={() => setActiveLegalTab("privacy")} 
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setActiveLegalTab("terms")} 
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                Terms of Service
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setActiveLegalTab("cookies")} 
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                Cookie Settings
              </button>
              <span>&bull;</span>
              <Link 
                href="/blog" 
                className="hover:text-indigo-600 transition-colors font-medium text-slate-500"
              >
                Writing Guides & Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Guide/How It Works Modal Backdrop */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGuideOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 max-h-[92dvh]"
              id="guide_modal_container"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                  <h3 className="font-display font-medium text-xs sm:text-sm tracking-tight">
                    Workbench & Readability Guide
                  </h3>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  aria-label="Close guide modal"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-3.5 sm:p-5 overflow-y-auto flex flex-col gap-3 sm:gap-4 text-slate-600 text-xs text-left">
                
                {/* Introduction section */}
                <div className="bg-slate-50/80 border border-slate-200/70 p-3 rounded-lg flex flex-col gap-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    How Humanization Operates
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-[11px] sm:text-xs">
                    AI models generate robotic signatures—uniform sentence lengths, sterile cadence, and repetitive filler connectors (e.g. <em>moreover</em>, <em>delve</em>, <em>tapestry</em>). AIText breaks these static patterns down and reconstructs your draft into fluid, natural human prose.
                  </p>
                </div>

                {/* Specific features compact grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        Flesch Reading Ease
                      </span>
                      <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">60-80 Goal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Measures syllable & sentence complexity. Raw AI text often drops below 30 (too dense), whereas our engine maintains smooth conversational clarity.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        Burstiness & Flow
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Cadence</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Monotone sentence lengths are a dead giveaway of AI. Real human editing mixes snappy 4-word statements with rich explanatory clauses.
                    </p>
                  </div>
                </div>

                {/* Pruning Manifesto */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-mono">
                      Purged Robotic Buzzwords
                    </h5>
                    <span className="text-[10px] text-slate-400">Replaced with organic phrasing</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-[11px]">
                    {AI_BUZZWORDS.slice(0, 9).map((item) => (
                      <div key={item.word} className="py-1 px-2 bg-rose-50/50 border border-rose-100/70 rounded font-mono text-center text-rose-700 line-through truncate">
                        {item.word}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy note */}
                <div className="text-[11px] text-slate-500 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[9px] uppercase shrink-0">Privacy</span>
                  <span>100% Zero retention. Text is parsed in-memory and never stored on any server.</span>
                </div>

              </div>

              {/* Close Action */}
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 hidden xs:inline">AIText (aitext.tech)</span>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="w-full xs:w-auto px-4 py-1.5 sm:py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-lg text-xs font-semibold cursor-pointer text-center"
                >
                  Return to Editor
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Legal Policy Overlays */}
      <AnimatePresence>
        {activeLegalTab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLegalTab(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 text-left max-h-[92dvh]"
              id="legal_modal_container"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                  <h3 className="font-display font-medium text-xs sm:text-sm tracking-tight">
                    Corporate & Legal Disclosures
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLegalTab(null)}
                  aria-label="Close legal modal"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Legal Tabs Navigator */}
              <div className="flex border-b border-slate-100 bg-slate-50/60 shrink-0">
                {(["privacy", "terms", "cookies"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLegalTab(tab)}
                    className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-center border-b-2 transition-colors capitalize ${
                      activeLegalTab === tab
                        ? "border-indigo-600 text-indigo-700 bg-white font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "cookies" ? "Cookie Settings" : `${tab} Policy`}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="p-3.5 sm:p-5 overflow-y-auto flex flex-col gap-3 text-slate-600 text-[11px] sm:text-xs">
                {activeLegalTab === "privacy" && (
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Privacy Commitment & Zero-Data Retention</h4>
                    <p className="leading-relaxed">
                      We take your privacy with absolute technical seriousness. Unlike standard generative suites that log inputs for downstream model training, aitext.tech operates in <strong>strictest zero-retention memory mode</strong>.
                    </p>
                    <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-500">
                      <li>Draft inputs are instantly parsed over ephemeral API sessions.</li>
                      <li>No text submitted is written to persistent databases.</li>
                      <li>Outputs are held exclusively in volatile memory for live stream delivery and flushed immediately thereafter.</li>
                    </ul>
                  </div>
                )}

                {activeLegalTab === "terms" && (
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Terms of Service & Licensing</h4>
                    <p className="leading-relaxed">
                      By accessing this workbench, you agree to the basic fair-use operational rules of this platform.
                    </p>
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                      <div className="font-bold text-slate-800 text-[11px] mb-0.5">Complete Output Ownership</div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Every sentence, adjusted rhythm, and variation returned belongs entirely and unconditionally to you. We claim zero royalty or copyright over your humanized drafts.
                      </p>
                    </div>
                  </div>
                )}

                {activeLegalTab === "cookies" && (
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Cookie Policy & Client Preferences</h4>
                    <p className="leading-relaxed">
                      We avoid active tracking pixels, advertising beacons, and third-party data tracking.
                    </p>
                    <span className="font-semibold text-slate-800 text-[11px]">Stored locally in browser:</span>
                    <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-500 text-[11px]">
                      <li>Tone preset preferences.</li>
                      <li>Draft caching to prevent typing loss on refresh.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 sm:px-5 sm:py-3 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLegalTab(null)}
                  className="w-full xs:w-auto px-4 py-1.5 sm:py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-lg text-xs font-semibold cursor-pointer text-center"
                >
                  Close Disclosures
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
