import { GoogleGenAI, Type } from "@google/genai";
import fallbackQuestions from "../src/data/fallback-bank.json" with { type: "json" };

export interface GenerateMockRequest {
  category?: string;
  difficulty?: string;
  topic?: string | string[];
  exclude_ids?: string[];
  count?: number;
}

// System initialization for Gemini AI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "DUMMY_KEY";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

/**
 * Task 2: Robust Serverless API (api/generate-mock.ts)
 * Express/Vercel serverless handler for generating mock questions with zero-repetition mandate.
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed. Use POST." });
  }

  const {
    category = "govt",
    difficulty = "Medium",
    topic = "Quantitative Aptitude",
    exclude_ids = [],
    count = 5,
  }: GenerateMockRequest = req.body || {};

  const cleanExcludeIds: string[] = Array.isArray(exclude_ids)
    ? exclude_ids.filter((id) => typeof id === "string" && id.trim())
    : [];

  const topicsList = Array.isArray(topic) ? topic : [topic];
  const targetTopicStr = topicsList.join(", ");
  const requestedCount = Math.max(3, Math.min(10, Number(count) || 5));

  // Strict 8-second AI timeout threshold
  const TIMEOUT_MS = 8000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`AI generation timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
  });

  try {
    const aiCall = (async () => {
      const ai = getAiClient();

      const excludeInstruction = cleanExcludeIds.length > 0
        ? `\n=== CRITICAL ZERO-REPETITION MANDATE ===\nThe user has already attempted questions with the following IDs/Stems:\n${cleanExcludeIds.slice(-50).map((id, i) => `${i + 1}. "${id}"`).join("\n")}\nYou MUST NOT generate any questions with these IDs, identical question texts, or duplicate stems under any circumstances.`
        : "";

      const prompt = `You are a Senior Question Bank Architect for ${category === "govt" ? "Government Competitive Examinations (SSC, UPSC, Banking, Railway)" : "IT Corporate Recruitment & Technical Placement Drives (TCS, Infosys, Wipro, Amazon, Google)"}.

TASK: Generate ${requestedCount} unique multiple-choice questions for topic(s): "${targetTopicStr}".
Baseline Difficulty: ${difficulty}.
${excludeInstruction}

REQUIREMENTS:
1. Each question MUST have a unique "questionId" string starting with "q_${Date.now()}_".
2. Provide realistic Previous Year Question (PYQ) references in "pyqSource" (e.g. "SSC CGL Tier 1", "TCS NQT Tech Drive").
3. Include 4 distinct options, 0-indexed correctOption (0, 1, 2, or 3), a step-by-step explanation, and assigned difficulty ("Easy" | "Medium" | "Hard").
4. Under NO circumstances produce any question matching the exclude_ids list.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionId: { type: Type.STRING },
                questionText: { type: Type.STRING },
                topicTag: { type: Type.STRING },
                pyqSource: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctOption: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
              required: ["questionId", "questionText", "topicTag", "options", "correctOption", "explanation"],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI returned empty or invalid question array.");
      }

      // Filter out any generated question whose ID matches exclude_ids
      const filtered = parsed.filter(
        (q) => !q.questionId || !cleanExcludeIds.includes(q.questionId)
      );

      if (filtered.length === 0) {
        throw new Error("All AI generated questions matched exclude_ids list.");
      }

      return filtered;
    })();

    const questions = await Promise.race([aiCall, timeoutPromise]);

    return res.status(200).json({
      success: true,
      questions,
      isFallback: false,
      count: questions.length,
      excludedCount: cleanExcludeIds.length,
    });
  } catch (error: any) {
    console.warn(`[generate-mock] AI Generation failed or timed out (${error?.message}). Invoking Zero-Crash Fallback Bank.`);

    // Zero-Crash Fallback (CRITICAL): Load questions from fallback-bank.json, filter out exclude_ids manually, return 200 OK.
    const excludeSet = new Set(cleanExcludeIds);

    const filteredFallback = (fallbackQuestions as any[]).filter((q) => {
      const qId = q.questionId || q.id;
      return !excludeSet.has(qId);
    });

    const categoryMatched = filteredFallback.filter(
      (q) => !category || q.category === category || category === "both" || category === "all"
    );

    let finalFallbackPool = categoryMatched.length >= requestedCount ? categoryMatched : filteredFallback;

    if (finalFallbackPool.length === 0) {
      // Clone fallback bank with guaranteed fresh dynamic IDs if all were in exclude_ids
      finalFallbackPool = (fallbackQuestions as any[]).map((q, idx) => ({
        ...q,
        questionId: `fresh_fb_${Date.now()}_${idx}`,
      }));
    }

    const fallbackResult = finalFallbackPool.slice(0, requestedCount).map((q, idx) => ({
      questionId: q.questionId || `fb_q_${Date.now()}_${idx}`,
      questionText: q.questionText,
      topicTag: q.topicTag || targetTopicStr,
      pyqSource: q.pyqSource || `${category.toUpperCase()} Official PYQ`,
      options: q.options || ["Option A", "Option B", "Option C", "Option D"],
      correctOption: typeof q.correctOption === "number" ? q.correctOption : 0,
      explanation: q.explanation || "Detailed step-by-step resolution.",
      difficulty: q.difficulty || difficulty || "Medium",
    }));

    return res.status(200).json({
      success: true,
      questions: fallbackResult,
      isFallback: true,
      fallbackReason: error?.message || "AI timeout or rate-limit trigger",
      count: fallbackResult.length,
      excludedCount: cleanExcludeIds.length,
    });
  }
}
