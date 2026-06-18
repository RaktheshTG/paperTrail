const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(prompt: string): Promise<string> {
  console.log("GROQ KEY:", GROQ_API_KEY);
  
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}