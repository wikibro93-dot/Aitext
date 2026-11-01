// Humanization API route with lazy init & Gemini model fallback for https://www.aitext.tech
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { runEditorialFallback } from "@/lib/editorialFallback";

export async function POST(req: NextRequest) {
  let text = "";
  let tone = "casual";

  try {
    const body = await req.json();
    text = body?.text;
    tone = body?.tone || "casual";

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required to perform humanization." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      // If API key is not yet set in environment, seamlessly use the editorial engine
      const localResult = runEditorialFallback(text, tone);
      return NextResponse.json(localResult);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const toneDescriptions: { [key: string]: string } = {
      casual: "Casual, relaxed, conversational, friendly. Like talking to a close friend over coffee. Use contractions, warm language, and natural sentence flows.",
      storyteller: "Engaging, narrative-driven style. Uses vivid, simple imagery, descriptive prose, and high-interest structural progression to hook readers.",
      professional: "Clear, authoritative, clean, and highly polished, yet conversational and easy to digest. Avoids rigid academic jargon while remaining strictly credible and engaging.",
      academic_simplified: "Educational, explanatory, clear, and highly accessible. Focuses on clarity, logical flow, and making complex ideas look incredibly simple and natural.",
      creative: "Expressive, witty, engaging, with rich sentence length variation. Bold word choices, crisp transitions, and a punchy rhythm.",
      empathetic: "Empathetic, deep, warm, and highly supportive. Feels like a caring counselor or dedicated advocate talking. Focused on personal validation and human warmth.",
    };

    const targetTone = toneDescriptions[tone] || toneDescriptions.casual;

    const systemInstruction = `You are a world-class, expert human editor who simplifies, clarifies, and breathes life into stiff, sterile, or robotic text.
Your strict goal is to take AI-generated or lifeless, robotic-sounding copy and rewrite it to sound authentic, naturally human-written, and smooth.

Follow these strict rules to rewrite the content:
1. Preserve original meaning: Absolutely do not alter the core message or factual claims.
2. Vary sentence length: Robotic writing usually has uniform sentence lengths. Build natural flow by mixing very short, punchy statements with moderately long, detailed ones.
3. Avoid robotic clichés and phrases: Completely purge words and phrases like "delve", "tapestry", "moreover", "furthermore", "it is clean that", "not only, but also", "testament", "in conclusion", "it is important to note", "crucial", "by exploring", "demystify".
4. Improve transition flow: Create simple, seamless transitions instead of clunky transitional adverbs.
5. Natural grammar and rhythm: Keep grammar correct but naturally relaxed, avoiding overly analytical or passive constructions.
6. Tone: Adjust the rewritten text to fit the requested tone perfectly: ${targetTone}.
7. Readability: Maintain high reading clarity. Avoid pretentious vocabulary where simpler terms are more powerful or conversational.

You must return the rewritten text combined with an informative, detailed analysis in pure JSON format. Ensure all strings are fully escaped.`;

    const prompt = `Please humanize the following text:
---
${text}
---

Apply the editor rules and output a JSON response matching the specifications.`;

    let response;
    // Free high-availability Gemini models
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];

    for (const modelName of candidateModels) {
      // Try each candidate with up to 2 attempts if transient 503 is encountered
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  humanizedText: {
                    type: Type.STRING,
                    description: "The rewritten, naturally human-sounding text.",
                  },
                  readabilityExplanation: {
                    type: Type.STRING,
                    description: "A short, professional summary of the core edits made to simplify and improve the flow.",
                  },
                  roboticPhrasesRemoved: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: {
                          type: Type.STRING,
                          description: "The specific stiff/robotic expression or transition found in the input.",
                        },
                        replacedWith: {
                          type: Type.STRING,
                          description: "The more natural human phrasing that replaced it.",
                        },
                        reason: {
                          type: Type.STRING,
                          description: "A brief architectural explanation of why this was changed.",
                        },
                      },
                      required: ["original", "replacedWith", "reason"],
                    },
                    description: "Specific instances where stiff adjectives, clunky transition words, or robotic phrases were pruned.",
                  },
                  sentenceLengthVarianceScore: {
                    type: Type.STRING,
                    description: "Status of sentence length variation (e.g., 'Excellent Variation' [Highly Human], 'Moderate Variation', or 'Low Variation').",
                  },
                  flowScoreBefore: {
                    type: Type.INTEGER,
                    description: "Estimated robotic-to-human flow score of the original text (1-100), where 1 is mechanical/robotic and 100 is fully human.",
                  },
                  flowScoreAfter: {
                    type: Type.INTEGER,
                    description: "Estimated robotic-to-human flow score of the final humanized text (1-100), aiming for 90+.",
                  },
                },
                required: [
                  "humanizedText",
                  "readabilityExplanation",
                  "roboticPhrasesRemoved",
                  "sentenceLengthVarianceScore",
                  "flowScoreBefore",
                  "flowScoreAfter",
                ],
              },
            },
          });

          if (response?.text) break;
        } catch {
          // If 503 / temporary spike, wait briefly before retrying
          if (attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }

      if (response?.text) break;
    }

    const resultText = response?.text;
    if (resultText) {
      try {
        const payload = JSON.parse(resultText);
        return NextResponse.json(payload);
      } catch {
        // If JSON parsing fails, fall through to fallback
      }
    }

    // Zero-downtime resilience: execute rules-based editorial engine
    const fallbackResult = runEditorialFallback(text, tone);
    return NextResponse.json(fallbackResult);

  } catch (err: any) {
    // Graceful recovery for any unexpected uncaught error
    if (text) {
      const fallbackResult = runEditorialFallback(text, tone);
      return NextResponse.json(fallbackResult);
    }

    return NextResponse.json(
      {
        error: "Unable to process text at this moment. Please verify your input and try again.",
      },
      { status: 500 }
    );
  }
}
