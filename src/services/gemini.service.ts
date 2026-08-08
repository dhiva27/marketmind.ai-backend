import dotenv from 'dotenv';

dotenv.config();

export async function generateGeminiResponse(messages: { role: string; content: string }[]) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  try {
    const systemPrompt = "You are MarketMind AI, a world-class AI marketing strategist and growth advisor. Provide ultra-structured, highly actionable, concise marketing strategies, campaign ideas, copy advice, and competitive insights.";

    const formattedContents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello MarketMind AI!' }],
      });
    }

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: formattedContents,
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data.error) {
      console.error('Google Gemini API Error:', data.error);
    }

    throw new Error('No valid response from Google Gemini API');
  } catch (error) {
    console.error('Gemini service failure:', error);
    throw error;
  }
}
