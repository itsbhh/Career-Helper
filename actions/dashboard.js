"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getValidModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const preferredModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
  for (const name of preferredModels) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      if (model) return model;
    } catch {
      console.warn(`Model ${name} not available, trying next...`);
    }
  }

  throw new Error("No valid Gemini model found. Check your API key or model names.");
}

export const generateAIInsights = async (industry) => {
  if (!industry || typeof industry !== "string") {
    throw new Error("Invalid industry passed to generateAIInsights");
  }

  const model = await getValidModel();

  const prompt = `
  Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
  {
    "salaryRanges": [
      { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
    ],
    "growthRate": number,
    "demandLevel": "High" | "Medium" | "Low",
    "topSkills": ["skill1", "skill2"],
    "marketOutlook": "Positive" | "Neutral" | "Negative",
    "keyTrends": ["trend1", "trend2"],
    "recommendedSkills": ["skill1", "skill2"]
  }
  Return ONLY the JSON. No markdown, no explanations.
  `;

  try {
    // Correct payload structure for Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Handle different SDK response shapes
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.response?.text?.() ||
      "";

    if (!text) throw new Error("Gemini returned empty response.");

    const cleaned = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Error generating AI insights:", err);
    throw new Error("Failed to generate AI insights from Gemini");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);
    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return industryInsight;
  }

  return user.industryInsight;
}