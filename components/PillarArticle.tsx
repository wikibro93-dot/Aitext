"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  GraduationCap, 
  PenTool, 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  Check, 
  Compass, 
  MessageSquare, 
  Heart, 
  Flame, 
  Zap, 
  Scale, 
  ShieldCheck,
  TrendingUp,
  FileCheck
} from "lucide-react";

interface PillarArticleProps {
  onScrollToWorkbench?: () => void;
  onSelectTone?: (toneId: string) => void;
  onLoadSample?: (text: string) => void;
}

const FAQS = [
  {
    q: "What is AIText?",
    a: "AIText is a free AI text humanizer and natural prose editor designed to improve AI-generated drafts by changing sentence structure, reducing repetitive patterns, improving transitions, and adjusting writing tone."
  },
  {
    q: "What does an AI text humanizer do?",
    a: "An AI text humanizer rewrites text to make it more natural and readable. Depending on the tool, this can involve changes to sentence structure, vocabulary, rhythm, transitions, and tone."
  },
  {
    q: "Can AIText improve ChatGPT writing?",
    a: "AIText can be used to edit AI-generated drafts, including content that was initially produced with tools such as ChatGPT. The resulting text should still be reviewed for accuracy, meaning, and suitability."
  },
  {
    q: "Is AIText a paraphrasing tool?",
    a: "AIText can rewrite and restructure text, but its focus is natural prose rather than simple word-for-word paraphrasing. It considers sentence rhythm, structure, transitions, and tone."
  },
  {
    q: "Can I use AIText for academic writing?",
    a: "AIText can help improve the readability of academic drafts. However, students and researchers should verify technical information, citations, arguments, and institutional requirements before submitting edited content."
  },
  {
    q: "Does humanizing text make it original?",
    a: "Rewriting can change wording and structure, but humanization alone does not automatically make ideas, facts, or source material original. Always respect copyright, attribution, citation, and academic integrity requirements."
  },
  {
    q: "Why does AI-generated text sometimes feel repetitive?",
    a: "AI-generated writing can use similar sentence structures, transitions, vocabulary, and explanatory patterns. Editing for sentence variation, stronger transitions, and more specific language can make the prose easier to read."
  },
  {
    q: "What is sentence burstiness?",
    a: "Sentence burstiness generally refers to variation in sentence length and structure. Human writing naturally contains a mixture of short and long sentences. Excessively uniform sentence patterns can make prose feel repetitive."
  }
];

const OVERUSED_AI_PHRASES = [
  "Moreover",
  "Furthermore",
  "Delve",
  "Tapestry",
  "Crucial",
  "In today's rapidly evolving world",
  "It is important to note",
  "In conclusion"
];

const TONE_PRESETS = [
  {
    id: "casual",
    title: "Casual Coffee Chat",
    desc: "Creates a relaxed and approachable voice. It can work well for informal articles, personal content, newsletters, and conversational explanations.",
    icon: MessageSquare,
    badge: "Relaxed & Friendly"
  },
  {
    id: "storyteller",
    title: "Vivid Storyteller",
    desc: "Focuses on narrative rhythm and more expressive language. It can be useful for stories, introductions, personal essays, and content where atmosphere matters.",
    icon: Compass,
    badge: "Narrative Rhythm"
  },
  {
    id: "professional",
    title: "Polished Expert",
    desc: "For professional and informative content, Polished Expert aims to maintain credibility while keeping the writing accessible.",
    icon: Briefcase,
    badge: "Enterprise Standard"
  },
  {
    id: "explainer",
    title: "The Explainer",
    desc: "Technical information can become difficult when every sentence uses specialist terminology. The Explainer style focuses on making complicated ideas easier to understand.",
    icon: GraduationCap,
    badge: "Educational Clarity"
  },
  {
    id: "creative",
    title: "Punchy & Witty",
    desc: "This style uses stronger variation and a more energetic voice. It can work for marketing content, opinion pieces, introductions, and creative web copy.",
    icon: Flame,
    badge: "High Cadence"
  },
  {
    id: "empathetic",
    title: "Warm & Empathetic",
    desc: "Some topics require a softer approach. This tone emphasizes supportive, compassionate, and approachable language.",
    icon: Heart,
    badge: "Supportive Tone"
  }
];

export function PillarArticle({ onScrollToWorkbench, onSelectTone, onLoadSample }: PillarArticleProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <article 
      id="seo_pillar_article" 
      className="mt-14 pt-12 border-t border-slate-200/90 text-slate-700 leading-relaxed"
      aria-label="AIText Comprehensive Guide & Documentation"
    >
      {/* Masthead Header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold mb-3.5 shadow-2xs">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Definitive Editorial Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-slate-900 leading-tight">
          AIText – Free AI Text Humanizer &amp; Natural Prose Editor
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI writing tools have made it easier than ever to create articles, essays, emails, reports, product descriptions, and other types of content. But fast writing does not always mean natural writing. AI-generated drafts can sometimes feel repetitive, overly formal, predictable, or disconnected from the way people normally communicate.
        </p>
      </header>

      {/* Intro Highlight Box */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-7 shadow-xs mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">
              The Purpose Behind AIText
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
              That is where <strong className="text-indigo-700 font-semibold">AIText</strong> comes in.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              AIText is a free AI text humanizer and natural prose editor designed to turn stiff, mechanical AI drafts into clearer, smoother, and more engaging writing. Instead of simply replacing individual words with synonyms, AIText looks at sentence structure, transitions, wording, rhythm, and common AI writing patterns to create prose that feels more natural to read.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you are a student working on a draft, a blogger preparing an article, a content writer editing a first draft, or a professional polishing business copy, AIText gives you a simple way to improve the flow of AI-assisted writing.
            </p>
          </div>
          {onScrollToWorkbench && (
            <button
              onClick={onScrollToWorkbench}
              className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PenTool className="h-3.5 w-3.5" />
              Try Workbench
            </button>
          )}
        </div>
      </div>

      <div className="space-y-14">
        {/* Section: What Is an AI Text Humanizer? */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              What Is an AI Text Humanizer?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An AI text humanizer is a writing tool that rewrites AI-generated or overly mechanical text so it sounds more natural and readable.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Many AI-generated paragraphs are grammatically correct, but they can share recognizable writing habits. Sentences may follow similar patterns, transitions can feel repetitive, and certain words or phrases may appear more frequently than they would in ordinary human writing.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Humanizing text is not simply about changing vocabulary. Good rewriting should improve the way ideas connect while preserving the original meaning.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AIText approaches this process as a natural prose editing task. It examines the structure of a draft, identifies stiff or repetitive patterns, and rewrites the content with more varied sentence lengths, smoother transitions, and a more appropriate tone.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 font-medium border-l-4 border-l-indigo-600">
            The goal is simple: <strong>make the writing easier and more enjoyable to read without unnecessarily changing the ideas behind it.</strong>
          </div>
        </section>

        {/* Section: Why Does AI Writing Sometimes Sound Robotic? */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              Why Does AI Writing Sometimes Sound Robotic?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AI writing can be extremely useful, but generated text often follows predictable patterns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Excessive Formality
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A simple point may be surrounded by phrases such as &ldquo;moreover,&rdquo; &ldquo;furthermore,&rdquo; &ldquo;it is important to note,&rdquo; or &ldquo;in conclusion.&rdquo; These expressions are not wrong, but using them repeatedly can make an article feel formulaic.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Monotonous Rhythm
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When several sentences have similar lengths and structures, the paragraph can become monotonous even when the information itself is useful.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Abstract Filler
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI writing can also rely heavily on abstract descriptions and generic transitions. The result may be polished but lack the natural variation found in human-edited prose.
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            That does not mean every AI-generated sentence sounds unnatural. In fact, some AI drafts already read very well. The purpose of an AI humanizer should therefore not be to rewrite everything unnecessarily. It should identify areas where the writing can be improved and make changes that serve the reader.
          </p>
        </section>

        {/* Section: How AIText Humanizes AI-Generated Text */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              How AIText Humanizes AI-Generated Text
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AIText is designed around several principles of natural writing:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Principle 1 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Pillar 01</span>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-2 mb-1.5">
                  1. More Varied Sentence Structure
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Human writers naturally mix short, medium, and longer sentences. A short sentence can add emphasis. A longer sentence can explain a complicated idea. Combining different structures creates a more comfortable reading rhythm.
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                AIText analyzes sentence patterns and introduces greater structural variety where appropriate so prose feels less repetitive.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Pillar 02</span>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-2 mb-1.5">
                  2. Removing Overused AI Clichés
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Some words and phrases appear frequently in AI-generated content. There is nothing inherently wrong with these expressions—the problem is repeated or unnecessary use.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {OVERUSED_AI_PHRASES.map((phrase) => (
                    <span 
                      key={phrase} 
                      className="px-2 py-0.5 rounded text-[11px] font-mono line-through bg-rose-50 border border-rose-100 text-rose-700"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                AIText identifies common patterns and replaces or removes unnecessary phrases when they make writing feel stiff.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Pillar 03</span>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-2 mb-1.5">
                  3. Natural Transitions
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Good writing does not need a formal transition before every idea. Human writers often connect thoughts naturally. Instead of repeatedly using &ldquo;moreover&rdquo; or &ldquo;furthermore,&rdquo; a paragraph can move from one idea to another through context and logical flow.
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                AIText creates smoother transitions so readers can follow arguments without feeling like they are reading a template.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Pillar 04</span>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-2 mb-1.5">
                  4. Tone-Based Rewriting
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Different situations require different voices. A research explanation should not sound like a casual conversation. A personal story should not read like a corporate report.
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  AIText provides multiple rewriting tones: <strong>Casual Coffee Chat, Vivid Storyteller, Polished Expert, The Explainer, Punchy &amp; Witty, and Warm &amp; Empathetic.</strong>
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                This gives you precise control over the final version instead of forcing every piece of content into the same voice.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Audience Specific Applications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 text-blue-700">
              <Briefcase className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              AIText for Every Writing Context
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Explore how natural prose editing serves different professional and academic disciplines:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            {/* Students & Academics */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Students &amp; Academic Writing
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                Students often use AI tools to brainstorm ideas, understand difficult concepts, organize information, or create an initial draft. The challenge is turning that initial draft into clear writing that reflects the student&apos;s intended meaning and voice.
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                <strong>Academic Notice:</strong> AIText should be treated as a <em>writing and editing assistant</em>, not a replacement for academic judgment. Always review technical terminology, citations, facts, and quotations carefully before submitting.
              </div>
            </div>

            {/* Bloggers & Content Writers */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <PenTool className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Bloggers &amp; Content Writers
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For bloggers and content creators, readability matters. Readers often scan articles before deciding whether to continue. Long blocks of repetitive text can make useful information difficult to consume.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex-1">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">Ideal For:</span>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-600" /> Blog introductions &amp; articles</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-600" /> Website &amp; product copy</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-600" /> Newsletters &amp; social drafts</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-600" /> Content outlines turned into prose</li>
                </ul>
              </div>
            </div>

            {/* Business & Professional */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Business &amp; Professional Writing
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                Professional communication needs clarity. Whether you are writing an email, company announcement, marketing message, proposal, or internal document, overly complicated language can make the message harder to understand.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                AIText helps simplify stiff wording and creates a cleaner professional tone. The <strong>Polished Expert</strong> style is particularly useful when you want writing that remains credible and professional without sounding unnecessarily formal.
              </p>
            </div>
          </div>
        </section>

        {/* Section: AI Humanizer vs. Paraphrasing Tool */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-100 text-purple-700">
              <Scale className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              AI Humanizer vs. Paraphrasing Tool
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An AI humanizer and a traditional paraphrasing tool may look similar, but their goals can be different. A basic paraphrasing tool often focuses on replacing words or rephrasing individual sentences. Humanization is broader:
          </p>

          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150">
              <div className="p-5 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                  Traditional Paraphrasing Tools
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&times;</span>
                    <span>Replaces words with rigid dictionary synonyms (thesaurus swapping).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&times;</span>
                    <span>Preserves the same stiff sentence length and awkward structure.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&times;</span>
                    <span>Retains mechanical connectors and robotic formulas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&times;</span>
                    <span>Example: Replacing &ldquo;important&rdquo; with &ldquo;significant&rdquo; without improving flow.</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-indigo-50/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  AIText Natural Prose Editor
                </h4>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Holistically optimizes sentence length, burstiness, and paragraph cadence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Purges artificial filler and restores natural conversational transitions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Adapts voice dynamically across 6 audience-focused tone profiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Can split long clauses, remove unnecessary padding, or reframe ideas.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Good humanization is therefore about <strong>better communication, not just different vocabulary.</strong>
          </p>
        </section>

        {/* Section: How to Humanize AI Text Without Losing Its Meaning */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-100 text-teal-700">
              <FileCheck className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              How to Humanize AI Text Without Losing Its Meaning
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            One of the most important parts of rewriting is preserving the original idea. A useful humanization process follows four structured steps:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono mb-2.5">
                  1
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                  Start With a Clear Draft
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Before rewriting, make sure the original content actually contains the information you want to communicate. Humanizing a weak argument will not make the argument stronger.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono mb-2.5">
                  2
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                  Choose the Tone
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Think about who will read the content. A university explanation, technical guide, personal story, and marketing page all require different voices.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono mb-2.5">
                  3
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                  Review the Rewrite
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Do not automatically accept every change. Compare important statements with the original draft. Check names, numbers, facts, technical terms, citations, and intended meaning.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono mb-2.5">
                  4
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                  Add Your Judgment
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The final editorial pass should come from you. Add examples, experiences, explanations, opinions where appropriate, and information that genuinely helps the reader.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Why Natural Prose Matters for SEO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              Why Natural Prose Matters for SEO
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Search engine optimization is not simply about repeating a keyword as many times as possible. Modern search engines evaluate whether content is useful, understandable, relevant, and created for people.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Natural prose contributes to a better reading experience because visitors can understand information more easily. Clear headings, concise explanations, logical structure, and useful answers make a page easier to navigate and retain reader attention.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            For SEO, focus on satisfying search intent. For example, someone searching for &ldquo;AI text humanizer&rdquo; may want to understand what a humanizer does, try a tool, compare different approaches, or learn how to improve AI-generated writing. A strong page should address those needs rather than repeating keywords artificially. AIText is designed around that reader-first principle: provide a useful tool and explain how natural prose editing works.
          </p>
        </section>

        {/* Section: Choose a Writing Style That Fits Your Content */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-rose-100 text-rose-700">
              <PenTool className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              Choose a Writing Style That Fits Your Content
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AIText provides 6 distinct prose styles configured in the workbench above. Each adapts vocabulary and cadence to your intended context:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {TONE_PRESETS.map((tone) => {
              const Icon = tone.icon;
              return (
                <div 
                  key={tone.id} 
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between group hover:border-indigo-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-50 text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {tone.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {tone.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tone.desc}
                    </p>
                  </div>
                  {onSelectTone && (
                    <button
                      onClick={() => {
                        onSelectTone(tone.id);
                        onScrollToWorkbench?.();
                      }}
                      className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-between cursor-pointer w-full"
                    >
                      <span>Select This Tone in Workbench</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: What Makes AIText Different? & Transparency */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What Makes AIText Different? */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Zap className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-display font-semibold text-slate-900">
                What Makes AIText Different?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              AIText is built as a natural language workbench rather than a simple word replacement system. Its editing approach focuses on the characteristics that influence how prose feels when read—including sentence rhythm, structural variation, cliché reduction, transitions, and tone.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The interface lets you work directly with a draft, review sentence variety metrics in real time, and choose a rewriting target instead of relying on one generic style.
            </p>
          </div>

          {/* Transparency on AI Detectors */}
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-display font-semibold text-slate-900">
                Transparent Editorial Integrity
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>Is AIText Free?</strong> Yes. AIText is presented as a free AI text humanizer and natural prose editor with no credit cards, registration, or paywalls required.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>Does AIText Guarantee AI-Detector Results?</strong> No responsible writing tool should promise that a rewritten passage will receive a specific score from every AI detector. Detectors use differing statistical heuristics that fluctuate frequently. AIText focuses on <strong>improving naturalness, readability, structure, and writing flow</strong> for human readers.
            </p>
          </div>
        </section>

        {/* Section: Best Practices for Using an AI Text Humanizer */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-display font-semibold text-slate-900 tracking-tight">
              Best Practices for Using an AI Text Humanizer
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An AI humanizer works best when it is part of a broader editing workflow. Start with accurate information. Use AI to help with brainstorming or drafting when appropriate. Humanize the prose when the writing feels repetitive or mechanical. Then perform a final manual edit:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              "Facts and statistics",
              "Names and dates",
              "Citations & references",
              "Technical terminology",
              "Grammar and spelling",
              "Original meaning",
              "Brand voice",
              "Claims requiring evidence"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-medium text-slate-800">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 pt-2">
            The goal is not to make every sentence sound unusually creative. The goal is to make the content <strong>clear, natural, useful, and appropriate for its audience.</strong>
          </p>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section className="space-y-4" id="faq_section">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <HelpCircle className="h-4 w-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Common questions about AI text humanization, burstiness, and workflow integration:
          </p>

          <div className="space-y-2.5 mt-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-slate-200/90 rounded-xl bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-indigo-600" : ""
                      }`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Make Your AI Drafts Easier to Read (Closing Call to Action) */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready to Humanize?</span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-tight text-white">
            Make Your AI Drafts Easier to Read
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            AI can help you write faster, but speed should not come at the expense of readability. A strong piece of writing should communicate its ideas clearly, guide the reader naturally from one point to the next, and use a voice appropriate for its audience.
          </p>
          <p className="text-xs sm:text-sm font-medium text-indigo-200 max-w-md mx-auto">
            AI can provide the first draft. With thoughtful editing, you can make it sound like writing people actually want to read.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onScrollToWorkbench && (
              <button
                onClick={onScrollToWorkbench}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <PenTool className="h-4 w-4" />
                <span>Paste Your Draft in AIText</span>
              </button>
            )}
            {onLoadSample && (
              <button
                onClick={() => {
                  onLoadSample("In the rapidly evolving landscape of modern technology, it is crucial to delve into how machine learning interfaces operate. Moreover, these systems are not only revolutionary but also serve as a profound testament to human ingenuity. In conclusion, it is important to note that these tools will foster connection across ecosystems.");
                  onScrollToWorkbench?.();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Load Sample &amp; Test</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
