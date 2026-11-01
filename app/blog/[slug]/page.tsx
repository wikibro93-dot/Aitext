import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";
import { 
  BookOpen, 
  PenTool, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Share2,
  Lightbulb
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | AIText",
    };
  }

  const canonicalUrl = `https://www.aitext.tech/blog/${post.slug}`;

  return {
    title: `${post.title} | AIText Blog`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: "AIText",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Schema.org BlogPosting + BreadcrumbList JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://www.aitext.tech/blog/${post.slug}#article`,
        "headline": post.title,
        "alternativeHeadline": post.subtitle,
        "description": post.excerpt,
        "datePublished": post.publishedAt,
        "dateModified": post.publishedAt,
        "mainEntityOfPage": `https://www.aitext.tech/blog/${post.slug}`,
        "author": {
          "@type": "Organization",
          "name": post.author.name,
        },
        "publisher": {
          "@type": "Organization",
          "name": "AIText",
          "url": "https://www.aitext.tech",
        },
        "articleSection": post.category,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.aitext.tech",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.aitext.tech/blog",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `https://www.aitext.tech/blog/${post.slug}`,
          },
        ],
      },
    ],
  };

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-indigo-100 overflow-x-hidden">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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

            {/* Nav Links */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">All</span> Guides
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

      {/* Main Article Content Container */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-3 py-6 sm:py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-[11px] text-slate-400 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-slate-700 transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
          <Link href="/blog" className="hover:text-slate-700 transition-colors shrink-0">
            Blog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
          <span className="text-slate-600 font-medium truncate max-w-[180px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-6 pb-5 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/90 px-2 py-0.5 rounded">
              {post.category}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {post.subtitle}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                AI
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-[11px] sm:text-xs">{post.author.name}</div>
                <div className="text-[10px] text-slate-400">{post.author.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 font-mono text-slate-400 text-[11px]">
              <Calendar className="h-3 w-3" />
              {post.publishedAt}
            </div>
          </div>
        </header>

        {/* Key Takeaways Box (Optimized for Google Featured Snippets) */}
        <section className="mb-8 p-4 sm:p-5 bg-indigo-50/60 rounded-xl border border-indigo-100/90 shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-900 font-display font-semibold text-xs sm:text-sm mb-2.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
            Key Editorial Takeaways
          </div>
          <ul className="space-y-2">
            {post.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Article Body Sections */}
        <article className="max-w-none flex flex-col gap-8">
          {post.sections.map((section, sIdx) => (
            <section key={sIdx} className="flex flex-col gap-3">
              <h2 className="text-lg sm:text-xl font-display font-semibold text-slate-900 tracking-tight">
                {section.heading}
              </h2>

              {section.content.map((pText, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {pText}
                </p>
              ))}

              {/* Optional Callout */}
              {section.callout && (
                <div className="my-1.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-xs mb-0.5 text-amber-950">
                      {section.callout.title}
                    </div>
                    <div className="text-xs leading-relaxed text-amber-800">
                      {section.callout.text}
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Table */}
              {section.table && (
                <div className="my-2.5 w-full max-w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full min-w-[500px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
                        {section.table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="py-2.5 px-3 sm:px-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-3 sm:px-4 font-mono font-medium text-rose-700 bg-rose-50/30">
                            {row[0]}
                          </td>
                          <td className="py-2 px-3 sm:px-4 text-slate-500">
                            {row[1]}
                          </td>
                          <td className="py-2 px-3 sm:px-4 font-medium text-emerald-700 bg-emerald-50/30">
                            {row[2]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Optional Before/After Comparison */}
              {section.exampleComparison && (
                <div className="my-2.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-rose-50/40 border border-rose-200/70 rounded-xl">
                    <div className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      {section.exampleComparison.badLabel}
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      &ldquo;{section.exampleComparison.bad}&rdquo;
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/70 rounded-xl">
                    <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {section.exampleComparison.goodLabel}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      &ldquo;{section.exampleComparison.good}&rdquo;
                    </p>
                  </div>

                  <div className="md:col-span-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <strong className="text-slate-800">Editorial Analysis:</strong> {section.exampleComparison.analysis}
                  </div>
                </div>
              )}
            </section>
          ))}
        </article>

        {/* In-Article Call to Action Card */}
        <section className="my-8 p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-semibold">
              Free Writing Utility
            </span>
            <h3 className="text-sm sm:text-base font-display font-semibold mt-0.5">
              Test Your Draft on AIText
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Paste your draft into our workbench to calculate Flesch Reading Ease and balance cadence in real-time.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white text-indigo-950 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            Launch Workbench
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Read Next Recommendations */}
        {otherPosts.length > 0 && (
          <section className="pt-6 border-t border-slate-200">
            <h3 className="text-sm sm:text-base font-display font-semibold text-slate-900 mb-3">
              Continue Reading
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherPosts.map((op) => (
                <Link
                  key={op.slug}
                  href={`/blog/${op.slug}`}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-2xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {op.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mt-1.5 leading-snug">
                      {op.title}
                    </h4>
                  </div>
                  <div className="mt-2 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                    Read Article <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-3 sm:px-6 mt-8 text-xs text-slate-500">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
