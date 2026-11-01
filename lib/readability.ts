/**
 * Readability and Text Quality Utilities
 */

// A comprehensive list of typical AI-sounding words and clunky clichés
export const AI_BUZZWORDS = [
  { word: "delve", reason: "Almost exclusively used in AI introductions." },
  { word: "tapestry", reason: "Symptomatic of robotic attempts at poetic writing." },
  { word: "moreover", reason: "Adds stiff, unnecessary essay-style structure." },
  { word: "furthermore", reason: "Too formal; creates a textbook transition feel." },
  { word: "testament", reason: "Overused cliché (e.g., 'a testament to...')." },
  { word: "in conclusion", reason: "Excessively formulaic, robotic transition." },
  { word: "it is important to note", reason: "Filler phrase; human authors get straight to the facts." },
  { word: "demystify", reason: "Over-represented in tech and promotional AI content." },
  { word: "not only, but also", reason: "Overly complex structure where simple parallel verbs work better." },
  { word: "pivotal", reason: "Severely overused by language models." },
  { word: "revolutionize", reason: "Unnecessarily dramatic marketing-speak preferred by AI." },
  { word: "game-changer", reason: "AI-preferred corporate jargon." },
  { word: "rapidly evolving", reason: "Extremely redundant phrase common in AI prose." },
  { word: "foster", reason: "Excessive usage in planning and outcome-driven AI text." },
  { word: "crucial", reason: "Over-assertions common in AI explanations." },
  { word: "it is worth noting", reason: "Unnecessary throat-clearing phrase." },
  { word: "beacon", reason: "Overdramatic AI metaphor for guides or lessons." },
];

/**
 * Counts syllables in a word using basic phonetic heuristics.
 */
function countSyllablesInWord(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  
  // Remove trailing silent 'e' and adjust for some small suffix rules
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  if (!matches) return 1;
  return matches.length;
}

export interface ReadabilityMetrics {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  syllableCount: number;
  fleschEaseScore: number;
  readingEaseCategory: string;
  readingEaseColor: string;
  estimatedReadingTimeSec: number;
  detectedBuzzwords: { buzzword: string; count: number; reason: string }[];
}

/**
 * Parses text and retrieves real-time editing statistics.
 */
export function analyzeTextReadability(text: string): ReadabilityMetrics {
  const cleanText = text || "";
  const characterCount = cleanText.length;
  
  // Clean paragraphs
  const paragraphs = cleanText.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Split into words
  const words = cleanText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);
  const wordCount = words.length;

  // Split into sentences using punctuation boundaries
  const sentences = cleanText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 2);
  const sentenceCount = Math.max(sentences.length, paragraphCount > 0 ? 1 : 0);

  // Total syllables
  let totalSyllables = 0;
  words.forEach(word => {
    totalSyllables += countSyllablesInWord(word);
  });

  // Calculate average sentence length
  const avgSentenceLength = wordCount > 0 && sentenceCount > 0 
    ? parseFloat((wordCount / sentenceCount).toFixed(1)) 
    : 0;

  // Calculate Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  let fleschEaseScore = 100;
  if (wordCount > 0 && sentenceCount > 0) {
    fleschEaseScore = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (totalSyllables / wordCount));
    // Bound the index
    fleschEaseScore = Math.max(0, Math.min(100, Math.round(fleschEaseScore)));
  }

  // Set category and colors
  let readingEaseCategory = "No Text";
  let readingEaseColor = "text-gray-400 border-gray-200 bg-gray-50";

  if (wordCount > 0) {
    if (fleschEaseScore >= 90) {
      readingEaseCategory = "Very Easy (5th Grade)";
      readingEaseColor = "text-emerald-700 border-emerald-200 bg-emerald-50/50";
    } else if (fleschEaseScore >= 80) {
      readingEaseCategory = "Easy (6th Grade)";
      readingEaseColor = "text-emerald-600 border-emerald-100 bg-emerald-50/30";
    } else if (fleschEaseScore >= 70) {
      readingEaseCategory = "Fairly Easy (7th Grade)";
      readingEaseColor = "text-teal-600 border-teal-100 bg-teal-50/30";
    } else if (fleschEaseScore >= 60) {
      readingEaseCategory = "Conversational (8th-9th Grade)";
      readingEaseColor = "text-blue-600 border-blue-100 bg-blue-50/30";
    } else if (fleschEaseScore >= 50) {
      readingEaseCategory = "Fairly Difficult (High School)";
      readingEaseColor = "text-amber-600 border-amber-100 bg-amber-50/30";
    } else if (fleschEaseScore >= 30) {
      readingEaseCategory = "Difficult (College Student)";
      readingEaseColor = "text-orange-600 border-orange-100 bg-orange-50/30";
    } else {
      readingEaseCategory = "Very Confusing (Academic / Strict AI)";
      readingEaseColor = "text-red-600 border-red-100 bg-red-50/30";
    }
  }

  // Estimated reading time at ~200 WPM
  const estimatedReadingTimeSec = Math.round((wordCount / 200) * 60);

  // Detect AI buzzwords in the text
  const detectedBuzzwords: { buzzword: string; count: number; reason: string }[] = [];
  const textLower = cleanText.toLowerCase();

  AI_BUZZWORDS.forEach(item => {
    // Search as word boundaries to prevent things like 'development' matching 'delve'
    const escapedWord = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");
    const occurrences = (textLower.match(regex) || []).length;
    
    if (occurrences > 0) {
      detectedBuzzwords.push({
        buzzword: item.word,
        count: occurrences,
        reason: item.reason,
      });
    }
  });

  return {
    characterCount,
    wordCount,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    syllableCount: totalSyllables,
    fleschEaseScore,
    readingEaseCategory,
    readingEaseColor,
    estimatedReadingTimeSec,
    detectedBuzzwords: detectedBuzzwords.sort((a,b) => b.count - a.count),
  };
}
