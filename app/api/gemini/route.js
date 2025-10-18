// app/api/gemini/route.js
import { faqs } from "../gemini/faqs";

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    // Find FAQ match (case-insensitive, exact or partial match)
    const faq = faqs.find(f =>
      f.question.toLowerCase() === message.trim().toLowerCase() ||
      f.question.toLowerCase().includes(message.trim().toLowerCase())
    );

    const text = faq
      ? faq.answer
      : "Sorry, I don't have an answer for that. Please select a question from FAQs.";

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (error) {
    console.error("POST /api/gemini error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// Optional GET to return all FAQs
export async function GET() {
  return new Response(JSON.stringify({ faqs }), { status: 200 });
}
