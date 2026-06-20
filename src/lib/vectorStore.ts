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
    },
    body: JSON.stringify({
      vectors,
      namespace,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert failed: ${err}`);
  }
}

// Clear all vectors in a namespace (called when loading a new paper)
export async function clearVectorStore(namespace: string) {
  try {
    await fetch(`${PINECONE_HOST}/vectors/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY,
      },
      body: JSON.stringify({
        deleteAll: true,
        namespace,
      }),
    });
  } catch {
    // namespace might not exist yet on first paper — safe to ignore
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