import { type Chunk } from "./chunk";

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_HOST = import.meta.env.VITE_PINECONE_HOST;

export type EmbeddedChunk = {
  chunk: Chunk;
  vector: number[];
};

// Upload embedded chunks to Pinecone
// "namespace" lets us keep different papers separate within the same index
export async function setVectorStore(embeddedChunks: EmbeddedChunk[], namespace: string) {
  const vectors = embeddedChunks.map((ec) => ({
    id: ec.chunk.id,
    values: ec.vector,
    metadata: { text: ec.chunk.text, index: ec.chunk.index },
  }));

  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
      "X-Pinecone-API-Version": "2025-04",
    },
    body: JSON.stringify({ vectors, namespace }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert failed: ${err}`);
  }
}
// Clear all vectors in a namespace (called when loading a new paper)
export async function clearVectorStore(namespace: string) {
  try {
    const res = await fetch(`${PINECONE_HOST}/namespaces/${namespace}`, {
      method: "DELETE",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "X-Pinecone-API-Version": "2025-04",
      },
    });
    // 404 here just means the namespace doesn't exist yet (first time this paper is processed) — totally fine
    if (!res.ok && res.status !== 404) {
      const err = await res.text();
      console.warn("Pinecone delete warning:", err);
    }
  } catch {
    // network error or namespace genuinely doesn't exist — safe to ignore, we're about to recreate it anyway
  }
}

// Query Pinecone for the most relevant chunks to a question vector
export async function findRelevantChunks(
  questionVector: number[],
  namespace: string,
  topK = 4
): Promise<Chunk[]> {
  const res = await fetch(`${PINECONE_HOST}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
      "X-Pinecone-API-Version": "2025-04",
    },
    body: JSON.stringify({
      vector: questionVector,
      topK,
      namespace,
      includeMetadata: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone query failed: ${err}`);
  }

  const data = await res.json();
  return data.matches.map((match: any) => ({
    id: match.id,
    text: match.metadata.text,
    index: match.metadata.index,
  }));
}