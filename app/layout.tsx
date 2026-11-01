// Root layout and SEO metadata for https://www.aitext.tech
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aitext.tech"),
  alternates: {
    canonical: "https://www.aitext.tech",
  },
  title: {
    default: "AIText – Free AI Text Humanizer & Natural Prose Editor",
    template: "%s | aitext.tech",
  },
  description:
    "Convert AI-generated or robotic writing into natural, undetectable, engaging, and authentic human prose with real-time readability and sentence-variety analytics at aitext.tech.",
  keywords: [
    "AI text humanizer",
    "humanize AI text",
    "bypass AI detection",
    "free AI humanizer",
    "aitext.tech",
    "AI to human text converter",
    "natural writing editor",
    "Flesch reading score",
    "sentence length variation",
    "anti-AI writing tool",
  ],
  authors: [{ name: "AIText", url: "https://www.aitext.tech" }],
  creator: "AIText (aitext.tech)",
  publisher: "AIText",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aitext.tech",
    siteName: "AIText",
    title: "AIText – Free AI Text Humanizer & Natural Prose Editor",
    description:
      "Transform monotone, robotic AI drafts into warm, authentic human prose with real-time readability metrics on aitext.tech.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIText – Free AI Text Humanizer & Natural Prose Editor",
    description:
      "Convert AI drafts into natural, human-written prose instantly with real-time sentence analytics.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://www.aitext.tech/#webapp",
      "name": "AIText – Free AI Text Humanizer",
      "url": "https://www.aitext.tech",
      "description":
        "An advanced online writing workbench that converts robotic, AI-generated drafts into natural, engaging human prose with real-time readability metrics.",
      "applicationCategory": "UtilitiesApplication",
      "applicationSubCategory": "AI Writing Assistant & Text Humanizer",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Interactive sentence length variance scoring",
        "Flesch Reading Ease calculation",
        "Robotic cliché & stiff vocabulary removal",
        "6 professional tone adaptation presets",
        "Side-by-side diff comparison mode",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.aitext.tech/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is AIText?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AIText is a free AI text humanizer and natural prose editor designed to improve AI-generated drafts by changing sentence structure, reducing repetitive patterns, improving transitions, and adjusting writing tone.",
          },
        },
        {
          "@type": "Question",
          "name": "What does an AI text humanizer do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An AI text humanizer rewrites text to make it more natural and readable. Depending on the tool, this can involve changes to sentence structure, vocabulary, rhythm, transitions, and tone.",
          },
        },
        {
          "@type": "Question",
          "name": "Can AIText improve ChatGPT writing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AIText can be used to edit AI-generated drafts, including content that was initially produced with tools such as ChatGPT. The resulting text should still be reviewed for accuracy, meaning, and suitability.",
          },
        },
        {
          "@type": "Question",
          "name": "Is AIText a paraphrasing tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AIText can rewrite and restructure text, but its focus is natural prose rather than simple word-for-word paraphrasing. It considers sentence rhythm, structure, transitions, and tone.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I use AIText for academic writing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AIText can help improve the readability of academic drafts. However, students and researchers should verify technical information, citations, arguments, and institutional requirements before submitting edited content.",
          },
        },
        {
          "@type": "Question",
          "name": "Does humanizing text make it original?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Rewriting can change wording and structure, but humanization alone does not automatically make ideas, facts, or source material original. Always respect copyright, attribution, citation, and academic integrity requirements.",
          },
        },
        {
          "@type": "Question",
          "name": "Why does AI-generated text sometimes feel repetitive?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI-generated writing can use similar sentence structures, transitions, vocabulary, and explanatory patterns. Editing for sentence variation, stronger transitions, and more specific language can make the prose easier to read.",
          },
        },
        {
          "@type": "Question",
          "name": "What is sentence burstiness?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sentence burstiness generally refers to variation in sentence length and structure. Human writing naturally contains a mixture of short and long sentences. Excessively uniform sentence patterns can make prose feel repetitive.",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.aitext.tech/#website",
      "url": "https://www.aitext.tech",
      "name": "AIText",
      "description": "Free AI Text Humanizer and Readability Workbench",
      "publisher": {
        "@type": "Organization",
        "name": "AIText",
        "url": "https://www.aitext.tech",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <head>
        <link rel="alternate" type="text/plain" href="https://www.aitext.tech/llms.txt" title="LLM Documentation" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body 
        className="font-sans antialiased text-slate-800 bg-[#f9fafc] min-h-screen flex flex-col selection:bg-indigo-100" 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
