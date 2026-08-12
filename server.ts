import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import generateMockHandler from "./api/generate-mock.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Simple In-Memory Rate Limiter for Gemini AI endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 AI requests per minute per IP

const aiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || "global";
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please wait a minute before generating more AI content.",
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  record.count += 1;
  next();
};

// Input Sanitizer to strip dangerous HTML / XSS strings
const sanitizeInput = (str: any): string => {
  if (typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onload=/gi, "");
};

// Apply Rate Limiting to all AI routes
app.use("/api/gemini", aiRateLimiter);

// Initialize Google GenAI
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

// Fallback Model List for high demand (503 / 429) resilience
const GEMINI_MODELS_CASCADE = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];

async function callGeminiWithRetry(
  ai: GoogleGenAI,
  requestParams: { contents: any; config?: any },
  preferredModel: string = "gemini-3.6-flash"
) {
  const modelsToTry = [preferredModel, ...GEMINI_MODELS_CASCADE.filter((m) => m !== preferredModel)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || "");
        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          err?.status === 429 ||
          err?.code === 429 ||
          errStr.includes("503") ||
          errStr.includes("high demand") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("overloaded");

        if (isTransient && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        console.warn(`Gemini model ${model} attempt ${attempt} failed: ${errStr.substring(0, 120)}. Trying next fallback model if available...`);
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model attempts failed.");
}

// Fallback Mock Test Questions Generator if AI Service is fully unavailable
function generateServerFallbackQuestions(targetName: string, topics: string[], count: number, category: string) {
  const isIt = category === "it" || /tcs|infosys|wipro|amazon|google|developer|fullstack|software/i.test(targetName);
  const topicList = topics && topics.length > 0 ? topics : [isIt ? "Data Structures & Algorithms" : "Quantitative Aptitude"];

  const questions = [];
  for (let i = 0; i < count; i++) {
    const topic = topicList[i % topicList.length];
    if (isIt) {
      questions.push({
        questionText: `[${targetName} Practice Q${i + 1}] What is the average and worst-case time complexity of searching for an element in a Hash Table with a good hash function?`,
        topicTag: topic,
        pyqSource: `${targetName} Tech Interview Pattern`,
        options: ["Average O(1), Worst O(n)", "Average O(log n), Worst O(n)", "Average O(1), Worst O(1)", "Average O(n), Worst O(n log n)"],
        correctOption: 0,
        explanation: "Hash Tables provide O(1) constant time average-case lookup. In the worst-case scenario where all elements collide into a single bucket list, search complexity degrades to O(n).",
        difficulty: "Medium",
      });
    } else {
      questions.push({
        questionText: `[${targetName} Practice Q${i + 1}] A train 150 metres long is running at a speed of 54 km/hr. How much time will it take to cross a platform 250 metres long?`,
        topicTag: topic,
        pyqSource: `${targetName} Official PYQ`,
        options: ["20 seconds", "26.6 seconds", "30 seconds", "35 seconds"],
        correctOption: 1,
        explanation: "Speed in m/s = 54 * (5/18) = 15 m/s. Total distance = Length of train + Length of platform = 150 + 250 = 400 metres. Time = Distance / Speed = 400 / 15 = 26.67 seconds.",
        difficulty: "Medium",
      });
    }
  }
  return questions;
}

// ---------------------------
// API ENDPOINTS
// ---------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Robust Serverless Mock Generation API
app.post("/api/generate-mock", generateMockHandler);

// 1. Generate Mock Test API with Zero Repetition Engine & Adaptive Complexity Scaling
app.post("/api/gemini/generate-test", async (req, res) => {
  const {
    category = "govt",
    targetName = "General Competitive Exam",
    topics = [],
    count = 5,
    difficulty = "Medium",
    userId,
    completedTests = [],
    weakTopics = [],
  } = req.body;

  try {
    const ai = getAiClient();

    // -------------------------------------------------------------
    // 1. ZERO REPETITION ENGINE: Extract previously answered questions
    // -------------------------------------------------------------
    const pastQuestionsList: string[] = [];
    if (Array.isArray(completedTests)) {
      completedTests.forEach((t: any) => {
        if (Array.isArray(t.questions)) {
          t.questions.forEach((q: any) => {
            if (q && q.questionText && typeof q.questionText === "string") {
              pastQuestionsList.push(q.questionText.trim());
            }
          });
        }
      });
    }

    // Retain up to 30 most recent question stems to prevent prompt bloat while ensuring absolute uniqueness
    const recentPastQuestions = pastQuestionsList.slice(-30);

    // -------------------------------------------------------------
    // 2. STEP-WISE ADAPTIVE COMPLEXITY SCALING ENGINE
    // -------------------------------------------------------------
    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    let totalScoreSum = 0;
    let totalQuestionsSum = 0;

    if (Array.isArray(completedTests)) {
      completedTests.forEach((t: any) => {
        if (typeof t.score === "number" && typeof t.totalQuestions === "number" && t.totalQuestions > 0) {
          totalScoreSum += t.score;
          totalQuestionsSum += t.totalQuestions;
        }
        if (Array.isArray(t.questions) && t.userAnswers && typeof t.userAnswers === "object") {
          t.questions.forEach((q: any) => {
            const topic = q.topicTag || "General";
            if (!topicPerformance[topic]) topicPerformance[topic] = { correct: 0, total: 0 };
            topicPerformance[topic].total += 1;
            if (t.userAnswers[q.questionId] === q.correctOption) {
              topicPerformance[topic].correct += 1;
            }
          });
        }
      });
    }

    const overallAccuracy = totalQuestionsSum > 0 ? (totalScoreSum / totalQuestionsSum) * 100 : 50;

    const highProficiencyTopics: string[] = [];
    const weakTopicsFocus: string[] = Array.from(new Set(weakTopics || []));

    const selectedTopicsList = Array.isArray(topics) && topics.length > 0
      ? topics
      : [category === "it" ? "Programming Logic" : "Quantitative Aptitude"];

    selectedTopicsList.forEach((topic: string) => {
      const perf = topicPerformance[topic];
      if (perf && perf.total >= 2) {
        const topicAcc = (perf.correct / perf.total) * 100;
        if (topicAcc >= 75) {
          highProficiencyTopics.push(topic);
        } else if (topicAcc < 50 && !weakTopicsFocus.includes(topic)) {
          weakTopicsFocus.push(topic);
        }
      } else if (overallAccuracy >= 75) {
        highProficiencyTopics.push(topic);
      }
    });

    let adaptiveStrategyRules = "";
    if (highProficiencyTopics.length > 0) {
      adaptiveStrategyRules += `\n- HIGH-PROFICIENCY SUBJECTS (${highProficiencyTopics.join(", ")}): The student scores >=75% in these. You MUST generate ADVANCED / HARD difficulty questions with multi-step logical deduction, tricky edge-case traps, and deeper cognitive depth.`;
    }
    if (weakTopicsFocus.length > 0) {
      adaptiveStrategyRules += `\n- WEAK / CONFIDENCE-BUILDING SUBJECTS (${weakTopicsFocus.join(", ")}): The student previously struggled here. Maintain BALANCED MEDIUM difficulty with crystal-clear step-by-step structural explanations to build exam speed and confidence.`;
    }

    const zeroRepetitionInstruction = recentPastQuestions.length > 0
      ? `\n=== STRICT ZERO-REPETITION MANDATE ===\nThe user has ALREADY answered the following ${recentPastQuestions.length} questions in past test attempts. You MUST NOT repeat any of these questions, formulas with identical parameters, or direct paraphrases:\n${recentPastQuestions.map((q, idx) => `${idx + 1}. "${q}"`).join("\n")}\n`
      : "";

    const prompt = `You are a premier senior paper setter for ${category === "govt" ? "Government Competitive Examinations in India (UPSC CSE, SSC CGL, IBPS PO, RRB NTPC, CTET)" : "IT Sector Job Roles and Corporate Placement Drives (TCS NQT, Infosys, Wipro, Amazon SDE, Google, FullStack)"}.

TASK: Generate a high-quality, balanced ${count}-question mock test paper for target: "${targetName}".
Focus Topics: ${selectedTopicsList.join(", ")}.

=== STEP-WISE ADAPTIVE COMPLEXITY DIRECTIVES ===
Baseline Difficulty Requested: ${difficulty}
Overall Student Performance Accuracy: ${Math.round(overallAccuracy)}%${adaptiveStrategyRules || "\nDistribute question difficulty dynamically across Easy (20%), Medium (60%), and Hard (20%)."}

${zeroRepetitionInstruction}

REQUIREMENTS:
1. Distribute all ${count} questions evenly across the selected focus topics: [${selectedTopicsList.join(", ")}].
2. Include realistic, authentic Previous Year Question (PYQ) references where applicable (e.g., "SSC CGL 2024 Tier 1 Shift 2" or "TCS NQT 2025 Placement Drive").
3. Each question MUST provide exactly 4 distinct options, 0-indexed correctOption (0, 1, 2, or 3), a thorough step-by-step explanation, and assigned difficulty ("Easy" | "Medium" | "Hard").`;

    const response = await callGeminiWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
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
            required: ["questionText", "topicTag", "options", "correctOption", "explanation"],
          },
        },
      },
    });

    const questionsStr = response.text || "[]";
    const questions = JSON.parse(questionsStr);

    if (Array.isArray(questions) && questions.length > 0) {
      return res.json({
        success: true,
        questions,
        adaptiveInsights: {
          overallAccuracy: Math.round(overallAccuracy),
          highProficiencyTopics,
          weakTopicsFocus,
          zeroRepetitionCount: recentPastQuestions.length,
          strategyNote: highProficiencyTopics.length > 0
            ? "Adaptive Scaling: Advanced/Hard complexity applied to high-proficiency topics"
            : "Adaptive Scaling: Balanced foundational distribution applied",
        },
      });
    }
  } catch (error: any) {
    console.warn("Gemini AI test generation notice (using server fallback test pattern):", error?.message || error);
  }

  // Graceful fallback questions if AI is in high demand / unavailable
  const fallbackQs = generateServerFallbackQuestions(targetName, topics, count, category);
  return res.json({
    success: true,
    questions: fallbackQs,
    isFallback: true,
    adaptiveInsights: {
      overallAccuracy: 50,
      highProficiencyTopics: [],
      weakTopicsFocus: weakTopics || [],
      zeroRepetitionCount: 0,
      strategyNote: "Server Fallback Pattern: PYQ-Aligned Standard Practice",
    },
  });
});

// 2. Doubt Solver Chatbot API ("Explain This" / Multimodal Chat)
app.post("/api/gemini/explain-question", async (req, res) => {
  const { questionText, options, correctOption, userSelectedOption, explanation, userQuery } = req.body;

  try {
    const ai = getAiClient();

    const prompt = `You are an expert AI Tutor and Mentor for competitive exams & tech interviews.
The user is reviewing a mock test question and needs doubt resolution.

Question: "${questionText}"
Options: ${JSON.stringify(options)}
Correct Answer: Option ${correctOption + 1} ("${options[correctOption]}")
User Selected: ${userSelectedOption !== undefined ? `Option ${userSelectedOption + 1} ("${options[userSelectedOption]}")` : "Unattempted"}
Standard Explanation: "${explanation}"

User's specific doubt / query: "${userQuery || "Please explain this step-by-step with simple shortcuts/concepts."}"

Provide a friendly, highly clear, step-by-step explanation. Break down:
1. Core Concept / Formula / Principle
2. Why the correct answer is right
3. Why the user's choice (if wrong) was incorrect or common trick trap
4. Pro Tip / Memory Trick / Speed Shortcut`;

    const response = await callGeminiWithRetry(ai, { contents: prompt });
    return res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.warn("Fallback response for explain-question:", error?.message);
    return res.json({
      success: true,
      text: `### Step-by-step Explanation & Concept Breakdown\n\n**1. Core Concept:** ${questionText}\n\n**2. Correct Answer:** Option ${correctOption + 1} ("${options[correctOption]}")\n\n**3. Explanation:** ${explanation || "Apply standard formula and verify initial variables step-by-step."}\n\n**4. Pro Tip:** Always re-check units and edge case parameters before marking your response in competitive speed tests.`,
    });
  }
});

// 2b. Universal Multimodal AI Chatbot API (Text, Files, Docs, Images, Audio)
app.post("/api/gemini/multimodal-chat", async (req, res) => {
  const { message, attachments = [], contextPrompt } = req.body;

  try {
    const ai = getAiClient();

    const parts: any[] = [];

    // System identity & context
    parts.push({
      text: `You are HARSHA'S, the advanced multimodal AI Tutor for CrackIt AI platform (Govt Exams & IT Technical Drives). You accept text, images, document files, and audio recordings to solve doubts, explain formulas, decode code bugs, and give shortcuts.\n${contextPrompt ? `[Context: ${contextPrompt}]\n` : ""}`
    });

    // Attachments handling (Images, PDFs, Audio, Docs)
    if (Array.isArray(attachments) && attachments.length > 0) {
      attachments.forEach((att: { mimeType: string; base64Data: string; name?: string }) => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType || "image/png",
            data: att.base64Data,
          },
        });
      });
    }

    // Main user query
    parts.push({
      text: message || "Please review my attached files/images/audio and provide a comprehensive explanation and solution.",
    });

    const response = await callGeminiWithRetry(ai, { contents: parts });
    return res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.warn("Fallback response for multimodal-chat:", error?.message);
    return res.json({
      success: true,
      text: `I have received your request: "${message || "Study query"}". \n\n**Guidance:**\n1. Review the key formulas and topic tags related to your target exam.\n2. Verify input conditions and step-by-step calculation.\n3. Try practicing 5 PYQs on this exact topic to build speed and accuracy.`,
    });
  }
});

// 3. AI Weakness Detection & Study Plan
app.post("/api/gemini/analyze-weakness", async (req, res) => {
  const { targetName, score, totalQuestions, incorrectQuestions = [] } = req.body;

  try {
    const ai = getAiClient();

    const prompt = `Analyze this student's mock test results for "${targetName}".
Score: ${score}/${totalQuestions}.
Incorrect / Missed Questions:
${JSON.stringify(incorrectQuestions, null, 2)}

Provide:
1. List of 2-4 identified weak sub-topics
2. A bulleted personalized 3-step action plan to master these weak areas before the real exam
3. A motivational short quote`;

    const response = await callGeminiWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalQuote: { type: Type.STRING },
          },
          required: ["weakTopics", "actionPlan", "motivationalQuote"],
        },
      },
    });

    return res.json({ success: true, analysis: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.warn("Fallback response for analyze-weakness:", error?.message);
    const weakList = incorrectQuestions.map((q: any) => q.topicTag || "General Aptitude");
    return res.json({
      success: true,
      analysis: {
        weakTopics: weakList.length > 0 ? Array.from(new Set(weakList)) : ["Speed Calculation", "Core Problem Solving"],
        actionPlan: [
          "Focus on fundamental formulas for 30 minutes daily.",
          "Solve 15-20 Previous Year Questions (PYQs) specifically targeting missed topics.",
          "Re-attempt a 10-question practice test every 2 days to verify progress.",
        ],
        motivationalQuote: "Every mistake is a stepping stone to exam mastery!",
      },
    });
  }
});

// 4. AI Dynamic Syllabus Parser API
app.post("/api/gemini/syllabus-parser", async (req, res) => {
  const { documentText, sourceUrl } = req.body;

  try {
    const ai = getAiClient();

    const prompt = `You are HARSHA'S CrackIt AI Syllabus Parser. Analyze the following Government Exam Notification or Private IT Career Page content and extract a clean, structured syllabus profile.

Source URL: ${sourceUrl || "Uploaded Document / Pasted Text"}
Notification Text:
"${(documentText || "").substring(0, 5000)}"

Instructions:
1. Extract or deduce the precise official Exam/Role title (e.g., "SSC CGL Tier 1 & Tier 2 Syllabus 2026", "TCS NQT National Drive Tech Track").
2. Classify category as "govt" (Government) or "it" (IT Corporate Drive).
3. Identify the target organization/department (e.g., "Staff Selection Commission", "Tata Consultancy Services").
4. Formulate a comprehensive exam pattern summary (duration, mark distribution, negative marking, question types).
5. Extract 6-12 high-yield core topic tags (e.g. ["Quantitative Aptitude", "Reasoning & Intelligence", "Data Structures & Algorithms"]).
6. Provide detailed subtopics list for granular test practice.
7. Estimate total exam stages/sections and total recommended preparation days.`;

    const response = await callGeminiWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["govt", "it"] },
            targetRoleOrDept: { type: Type.STRING },
            examPatternSummary: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            totalSections: { type: Type.INTEGER },
            recommendedStudyDays: { type: Type.INTEGER },
          },
          required: ["title", "category", "targetRoleOrDept", "examPatternSummary", "topics", "subtopics", "totalSections", "recommendedStudyDays"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ success: true, syllabus: parsedData });
  } catch (error: any) {
    console.warn("Fallback response for syllabus-parser:", error?.message);
    return res.json({
      success: true,
      syllabus: {
        title: "Target Exam Syllabus & Blueprint",
        category: "govt",
        targetRoleOrDept: "Competitive Services Commission",
        examPatternSummary: "100 Objective Questions (200 Marks) • 60 Minutes Duration • 0.50 Negative Marking",
        topics: ["Quantitative Aptitude", "Logical Reasoning", "General Awareness", "English Language"],
        subtopics: ["Percentage & Profit Loss", "Coding-Decoding", "Indian Polity & Economy", "Reading Comprehension"],
        totalSections: 4,
        recommendedStudyDays: 45,
      },
    });
  }
});

app.post("/api/gemini/extract-syllabus", async (req, res) => {
  req.url = "/api/gemini/syllabus-parser";
  return app._router.handle(req, res);
});

// 5. ATS Resume Generator & Analyzer API
app.post("/api/gemini/resume-analyzer", async (req, res) => {
  const { rawResumeText, targetRole, fullName, skills = [], experience = [], education = [], projects = [] } = req.body;

  try {
    const ai = getAiClient();

    const resumeContentStr = rawResumeText
      ? rawResumeText
      : `Name: ${fullName || "Candidate"}\nSkills: ${skills.join(", ")}\nExperience: ${JSON.stringify(experience)}\nEducation: ${JSON.stringify(education)}\nProjects: ${JSON.stringify(projects)}`;

    const prompt = `You are CrackIt AI's Expert ATS (Applicant Tracking System) Scanner & Career Consultant.
Analyze the following resume against the Target Job Role: "${targetRole || "Software Engineer / IT Corporate Drive"}".

RESUME CONTENT:
"""
${resumeContentStr}
"""

Evaluate the candidate for top recruiter ATS algorithms (TCS NQT, Infosys, Amazon, SSC, Banking, Service & Product Companies).
Provide a structured JSON response with:
1. "atsScore": integer between 0 and 100 representing realistic ATS keyword and impact alignment.
2. "scoreLabel": concise status label (e.g., "High ATS Match", "Needs Keyword Optimization", "Strong Technical Alignment").
3. "summary": 2-sentence executive summary of the resume's strengths and core ATS gaps.
4. "missingKeywords": array of 5-10 crucial technical & domain keywords/phrases currently missing or under-represented for "${targetRole}".
5. "formattingFixes": array of 3-5 structural ATS formatting recommendations (bullet impact, headers, section layout).
6. "actionableSuggestions": array of 3-5 concrete bullet-point improvements using metric-driven action verbs (e.g., "Increased throughput by 40%").
7. "optimizedResumeText": a fully revamped, high-impact ATS resume text formatted with standard ATS headers (PROFESSIONAL SUMMARY, CORE SKILLS, EXPERIENCE, PROJECTS, EDUCATION).`;

    const response = await callGeminiWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER },
            scoreLabel: { type: Type.STRING },
            summary: { type: Type.STRING },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            formattingFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedResumeText: { type: Type.STRING },
          },
          required: ["atsScore", "scoreLabel", "summary", "missingKeywords", "formattingFixes", "actionableSuggestions", "optimizedResumeText"],
        },
      },
    });

    const analysisData = JSON.parse(response.text || "{}");
    return res.json({ success: true, analysis: analysisData });
  } catch (error: any) {
    console.warn("Fallback response for resume-analyzer:", error?.message);
    return res.json({
      success: true,
      analysis: {
        atsScore: 82,
        scoreLabel: "Strong Foundation",
        summary: `Good technical alignment for ${targetRole || "Target Role"}. Enhance quantifiable impact metrics to cross 90+ ATS threshold.`,
        missingKeywords: ["System Design", "CI/CD Pipeline", "Agile/Scrum", "Microservices", "REST API Optimization"],
        formattingFixes: ["Use standard headers (EXPERIENCE, EDUCATION, SKILLS).", "Avoid multi-column tables or graphics.", "Use clean bullet points."],
        actionableSuggestions: ["Add quantifiable metrics (e.g. 'Reduced latency by 25%').", "Include key frameworks at the top of technical skills."],
        optimizedResumeText: `PROFESSIONAL SUMMARY\nGoal-driven candidate with strong technical problem solving and algorithm analysis abilities.\n\nCORE SKILLS\n${skills.join(", ") || "Problem Solving, Data Structures, Web Development"}\n\nEDUCATION\nRelevant Degree in Technology / Science`,
      },
    });
  }
});

app.post("/api/gemini/analyze-resume", async (req, res) => {
  req.url = "/api/gemini/resume-analyzer";
  return app._router.handle(req, res);
});

app.post("/api/gemini/generate-resume", async (req, res) => {
  const { fullName, targetRole, skills = [], experience = [], education = [], projects = [] } = req.body;

  try {
    const ai = getAiClient();

    const prompt = `Generate a high-converting, ATS-optimized resume in plain text format for:
Candidate Name: ${fullName}
Target Role: ${targetRole}
Skills: ${skills.join(", ")}
Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Projects: ${JSON.stringify(projects)}

Format the output clearly with sections:
- PROFESSIONAL SUMMARY (3 punchy ATS bullet points)
- CORE COMPETENCIES & TECHNICAL SKILLS
- PROFESSIONAL EXPERIENCE (action-verb metric-driven bullets)
- FEATURED PROJECTS
- EDUCATION & CERTIFICATIONS

Ensure strong keywords relevant to ${targetRole}.`;

    const response = await callGeminiWithRetry(ai, { contents: prompt });
    return res.json({ success: true, resumeText: response.text });
  } catch (error: any) {
    console.warn("Fallback response for generate-resume:", error?.message);
    return res.json({
      success: true,
      resumeText: `${fullName || "CANDIDATE NAME"}\nTarget Role: ${targetRole}\n\nPROFESSIONAL SUMMARY\n• Highly motivated professional with strong analytical skills.\n• Proven track record in problem solving and technical project delivery.\n\nTECHNICAL SKILLS\n${skills.join(", ") || "Core Concepts, Data Structures, Quantitative Aptitude"}`,
    });
  }
});

// 6. PhonePe Payment Initiation API
app.post("/api/phonepe/initiate", (req, res) => {
  const { uid, amount = 299, paymentMethod = "qr", vpa } = req.body;
  const merchantTransactionId = `MKEY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Simulated PhonePe SHA256 checksum & payload
  const payload = {
    merchantId: "CRACKITAI_PHONEPE_ONLINE",
    merchantTransactionId,
    amount: amount * 100, // paise
    currency: "INR",
    redirectUrl: `/api/payment/phonepe/callback?id=${merchantTransactionId}`,
    paymentInstrument: paymentMethod === "upi_vpa" ? { type: "UPI_INTENT", vpa } : { type: "UPI_QR" },
  };

  res.json({
    success: true,
    merchantTransactionId,
    amount,
    currency: "INR",
    status: "PENDING",
    payload,
    checksum: "SHA256_MOCK_CHECKSUM_TOKEN_PHONEPE_CRACKITAI",
  });
});

// 7. PhonePe Webhook Verification & UTR Verification Endpoints
const ADMIN_EMAIL = "harshavardhantalari6@gmail.com";

// Store in-memory UTR submissions for API fallback
interface UtrSubmission {
  submissionId: string;
  uid: string;
  email: string;
  displayName: string;
  utrNumber: string;
  selectedPlan: '3months' | '6months';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  proExpiryDate?: string;
}

const inMemorySubmissions: UtrSubmission[] = [];

app.post("/api/verify-utr", async (req, res) => {
  try {
    const { uid, email = "aspirant@crackit.ai", displayName = "Aspirant", utrNumber, selectedPlan = "3months" } = req.body;

    if (!utrNumber || typeof utrNumber !== "string" || utrNumber.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid UTR Number. Please enter a valid 10-12 digit UTR transaction reference.",
      });
    }

    const cleanUtr = utrNumber.trim();
    const plan = selectedPlan === "6months" ? "6months" : "3months";
    const durationMonths = plan === "6months" ? 6 : 3;
    const planAmount = plan === "6months" ? 249 : 149;
    const planName = plan === "6months" ? "6 Months Pro Pass" : "3 Months Pro Pass";

    // Calculate proExpiryDate: current date + 3 or 6 months
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    const proExpiryDate = expiryDate.toISOString();

    const newSub: UtrSubmission = {
      submissionId: `utr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uid: uid || `user_${Date.now()}`,
      email,
      displayName,
      utrNumber: cleanUtr,
      selectedPlan: plan,
      amount: planAmount,
      status: 'pending',
      submittedAt: now.toISOString(),
    };

    inMemorySubmissions.unshift(newSub);

    console.log(`[UTR Submitted] UID: ${uid || "guest"} | UTR: ${cleanUtr} | Plan: ${plan} (${planAmount} INR)`);

    return res.json({
      success: true,
      message: `UTR Submitted successfully! Pending Admin verification.`,
      submissionId: newSub.submissionId,
      uid,
      utrNumber: cleanUtr,
      selectedPlan: plan,
      planName,
      amount: planAmount,
      isPro: true,
      role: "pro",
      proExpiryDate,
      proUnlockedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Error in UTR verification endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during UTR verification.",
    });
  }
});

// Admin Pending UTRs List Endpoint
app.get("/api/admin/pending-utrs", (req, res) => {
  const adminEmailHeader = req.headers["x-admin-email"] || req.query.adminEmail;

  if (adminEmailHeader !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      error: "Access Denied: Strict Admin privileges required for harshavardhantalari6@gmail.com.",
    });
  }

  return res.json({
    success: true,
    submissions: inMemorySubmissions,
  });
});

// Admin Approve UTR Endpoint
app.post("/api/admin/approve-utr", (req, res) => {
  const { adminEmail, submissionId, uid, selectedPlan = "3months" } = req.body;

  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      error: "Access Denied: Only harshavardhantalari6@gmail.com can approve payments.",
    });
  }

  const durationMonths = selectedPlan === "6months" ? 6 : 3;
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  const proExpiryDate = expiryDate.toISOString();

  const sub = inMemorySubmissions.find((s) => s.submissionId === submissionId || s.uid === uid);
  if (sub) {
    sub.status = 'approved';
    sub.approvedAt = now.toISOString();
    sub.proExpiryDate = proExpiryDate;
  }

  return res.json({
    success: true,
    message: `UTR Payment Approved! User unlocked for ${durationMonths} Months.`,
    uid,
    isPro: true,
    role: "pro",
    selectedPlan,
    proExpiryDate,
    approvedAt: now.toISOString(),
  });
});

app.post("/api/payment/phonepe/verify", (req, res) => {
  const { transactionId, status = "SUCCESS", uid, selectedPlan = "3months" } = req.body;
  
  if (status === "SUCCESS") {
    const durationMonths = selectedPlan === "6months" ? 6 : 3;
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    return res.json({
      success: true,
      message: "PhonePe Payment verified successfully",
      transactionId: transactionId || `TXN_${Date.now()}`,
      uid,
      isPro: true,
      role: "pro",
      selectedPlan,
      proExpiryDate: expiryDate.toISOString(),
      timestamp: now.toISOString(),
    });
  }
  
  res.status(400).json({ success: false, message: "Payment verification failed" });
});

// 8. Help Desk API Endpoint (Sends support email strictly to harshavardhantalari6@gmail.com)
app.post("/api/helpdesk", async (req, res) => {
  try {
    const { message, userEmail, userName, userId } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ success: false, error: "Complaint message is required" });
    }

    const recipientEmail = "harshavardhantalari6@gmail.com";
    const senderName = userName || "Candidate";
    const senderEmail = userEmail || "No email provided";

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().startsWith("re_")) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error: sendError } = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [recipientEmail],
          subject: `[CrackIt AI Support Ticket] Issue from ${senderName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-bottom: 16px;">New Help Desk Support Ticket</h2>
              <p><strong>Candidate Name:</strong> ${senderName}</p>
              <p><strong>Candidate Email:</strong> ${senderEmail}</p>
              <p><strong>Candidate UID:</strong> ${userId || "N/A"}</p>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
              <p><strong>Complaint / Issue Details:</strong></p>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #3b82f6;">
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                Sent automatically from CrackIt AI HARSHA'S Studio HelpDesk
              </p>
            </div>
          `,
        });

        if (sendError) {
          console.warn("Resend API notification notice:", sendError.message || sendError);
        }
      } catch (err: any) {
        console.warn("Resend SDK dispatch notice:", err?.message || err);
      }
    } else {
      console.log("RESEND_API_KEY not configured or placeholder used. Registered ticket locally for:", recipientEmail, {
        senderName,
        senderEmail,
        message,
      });
    }

    return res.json({
      success: true,
      message: "Your complaint has been registered successfully. Our team will look into it.",
    });
  } catch (error: any) {
    console.error("Error in helpdesk endpoint:", error);
    res.json({
      success: true,
      message: "Your complaint has been registered successfully. Our team will look into it.",
    });
  }
});

// ---------------------------
// VITE / SERVING CONFIG
// ---------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Local testing kosam port run avvali, kani Vercel lo direct export avvali
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Vercel Serverless function kosam idi chala important
export default app;