import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "AviaAI", // Unique app ID
  name: "AviaAI",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
