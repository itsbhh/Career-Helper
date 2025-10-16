"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Use Gemini SDK directly (simpler & stable)
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generate AI-based industry insights
 */
async function generateAIInsights(industry) {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any extra text:
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

    Only return valid JSON — no markdown, code fences, or explanations.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI insights JSON:", cleaned);
    throw new Error("AI returned invalid JSON");
  }
}

/**
 * Update user profile and handle industry insights
 */
// Update user profile and handle industry insights
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!data || typeof data !== "object") {
    throw new TypeError("Payload must be a valid object");
  }

  const { industry, experience, bio, skills } = data;
  if (!industry || typeof industry !== "string") {
    throw new Error("Industry is required and must be a string");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const result = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: { industry },
      });

      if (!industryInsight) {
        console.log("⚙️ Generating new AI insights for:", industry);
        const insights = await generateAIInsights(industry);
        industryInsight = await tx.industryInsight.create({
          data: {
            industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { industry, experience, bio, skills },
      });

      return { updatedUser, industryInsight };
    });

    revalidatePath("/");

    const safeUser = JSON.parse(JSON.stringify(result.updatedUser));
    return safeUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error("Failed to update profile");
  }
}



/**
 * Check if user completed onboarding
 */
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  return { isOnboarded: !!user?.industry };
}
