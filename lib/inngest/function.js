import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    triggers: [{ cron: "0 0 * * 0" }],
  },
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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

IMPORTANT: Return ONLY the JSON.
`;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => model.generateContent(p),
        prompt
      );

      const text =
  res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

if (!text) {
  throw new Error("Empty response from Gemini");
}


const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

let insights;

try {
  insights = JSON.parse(cleanedText);
} catch (err) {
  console.error("Invalid JSON from Gemini:", cleanedText);
  throw new Error("Failed to parse AI response");
}

// Extra safety: ensure it's an object
if (!insights || typeof insights !== "object") {
  throw new Error("AI returned invalid payload");
}

      await step.run(`Update ${industry}`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);