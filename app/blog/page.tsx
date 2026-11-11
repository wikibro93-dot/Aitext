import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { 
  BookOpen, 
  PenTool, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

export const metadata: Metadata = {
  title: "Writing Guides & AI Text Humanizer Insights | AIText",
  description:
    "Explore authentic, human-written editorial guides on sentence burstiness, Flesch Reading Ease, eliminating robotic AI clichés, and mastering natural prose on aitext.tech.",
  alternates: {
    canonical: "https://www.aitext.tech/blog",
  },
  openGraph: {
    title: "Writing Guides & AI Text Humanizer Insights | AIText",
    description:
      "Explore authentic, human-written editorial guides on sentence burstiness, Flesch Reading Ease, eliminating robotic AI clichés, and mastering natural prose on aitext.tech.",
    url: "https://www.aitext.tech/blog",
    siteName: "AIText",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing Guides & AI Text Humanizer Insights | AIText",
    description:
      "Explore authentic, human-written editorial guides on sentence burstiness, Flesch Reading Ease, eliminating robotic AI clichés, and mastering natural prose on aitext.tech.",
  },
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://www.aitext.tech/blog#blog",
  "url": "https://www.aitext.tech/blog",
  "name": "AIText Writing & Readability Insights",
  "description":
    "Authentic editorial guides and tutorials on overcoming robotic AI writing patterns, calculating sentence burstiness, and refining human prose.",
  "publisher": {
    "@type": "Organization",
    "name": "AIText",
    "url": "https://www.aitext.tech",
  },
  "blogPost": BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://www.aitext.tech/blog/${post.slug}`,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": post.author.name,
    },
  })),
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-indigo-100 overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* Decorative Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500" />

      {/* Compact Responsive Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="mx-auto max-w-5xl px-3 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-2">
            {/* Logo */}
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

            {/* Nav Actions - Sleek & Compact */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                Back
              </Link>
              <Link
                href="/ai-video-detector"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Video Detector
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs rounded-lg transition-all active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Workbench
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Hero Header */}
      <section className="bg-white border-b border-slate-200/70 py-6 sm:py-8 px-3 sm:px-6">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold mb-2.5">
            <BookOpen className="h-3 w-3" />
            Editorial Writing Guides
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-slate-900 leading-tight">
            The Science & Craft of <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy">Natural Prose</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Short, authentic editorial lessons on breaking robotic AI monotony, mastering sentence burstiness, and keeping readers engaged.
          </p>
        </div>
      </section>

      {/* Main Blog Articles List - Compact, Mobile-Optimized Grid */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-3 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-display font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>

                {/* Key Takeaway Mini Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                    Core Takeaway
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {post.keyTakeaways[0]}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {post.publishedAt}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform"
                >
                  Read Guide
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Compact CTA Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 font-semibold">
              Live Interactive Workbench
            </span>
            <h3 className="text-sm sm:text-base font-display font-semibold mt-0.5 text-white">
              Put These Principles into Practice on Your Drafts
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              Calculate Flesch Reading Ease, measure sentence burstiness, and purge robotic buzzwords in real-time.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-950 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-all shrink-0 shadow-xs"
          >
            Launch Workbench
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-3 sm:px-6 mt-8 text-xs text-slate-500">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">AIText (aitext.tech)</span>
            <span>&bull;</span>
            <span>Zero Data Retention</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Workbench
            </Link>
            <Link href="/blog" className="hover:text-indigo-600 transition-colors font-medium text-slate-700">
              Writing Guides
            </Link>
            <a href="https://www.aitext.tech/sitemap.xml" className="hover:text-indigo-600 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
