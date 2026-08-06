// src/services/openai.service.ts
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(messages: { role: string; content: string }[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
    });
    const result = completion.choices[0].message?.content ?? "";
    return result;
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Failed to get response from OpenAI");
  }
}
