const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(systemPrompt: string, userContent: string, maxTokens = 1024): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function generateSummary(paperText: string): Promise<string> {
  return callGroq(
    `You are an expert at explaining complex research papers to curious non-experts — 
    people who are smart and interested but have no PhD. 
    Write in plain English, avoid jargon, use analogies where helpful. 
    Structure your response as 4 clear paragraphs with a blank line between each.
    Do not use bullet points or headers.`,
    `Here is the research paper text. Write a plain English summary:\n\n${paperText.slice(0, 6000)}`
  );
}

export async function generateWhyItMatters(paperText: string): Promise<string> {
  return callGroq(
    `You are an expert at explaining why research matters to the real world.
    Your audience is curious non-experts — smart people who want to understand impact.
    Write 3 paragraphs explaining: what problem this solves, who benefits, and what changes because of this work.
    Use plain English, no jargon. Separate paragraphs with a blank line.`,
    `Here is the research paper text. Explain why it matters:\n\n${paperText.slice(0, 4000)}`
  );
}

export async function generateConceptMap(paperText: string): Promise<{
  nodes: { id: string; label: string; definition: string }[];
  edges: { from: string; to: string; label: string }[];
}> {
  const raw = await callGroq(
    `You are an expert at extracting key concepts from research papers.
    Return ONLY a valid JSON object — no explanation, no markdown, no code blocks.
    The JSON must have this exact structure:
    {
      "nodes": [
        { "id": "concept_id", "label": "Concept Name", "definition": "One sentence definition." }
      ],
      "edges": [
        { "from": "concept_id", "to": "other_id", "label": "relationship" }
      ]
    }
    Extract 6-8 key concepts and their relationships. Use simple lowercase ids with underscores.`,
    `Here is the research paper text. Extract the concept map:\n\n${paperText.slice(0, 4000)}`
  );

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      nodes: [{ id: "paper", label: "Research Paper", definition: "Could not parse concept map." }],
      edges: [],
    };
  }
}

export async function askQuestion(
  paperText: string,
  question: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful research assistant explaining a specific paper to a curious non-expert.
          Answer questions in plain English, be concise, use analogies where helpful.
          Base your answers on this paper text:
          ${paperText.slice(0, 3000)}`,
        },
        ...history,
        { role: "user", content: question },
      ],
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}