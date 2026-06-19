import { type Chunk } from "./chunk";

export type EmbeddedChunk = {
  chunk: Chunk;
  vector: number[];
};

// THE ACTUAL STORE — holds all embedded chunks for the current paper, in memory
let store: EmbeddedChunk[] = [];

// Save embedded chunks into the store (called once, when a paper is processed)
export function setVectorStore(chunks: EmbeddedChunk[]) {
  store = chunks;
}

// Clear the store (called when user loads a new paper)
export function clearVectorStore() {
  store = [];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return dotProduct / (magnitudeA * magnitudeB);
}

// Search the CURRENT store for the most relevant chunks to a question vector
export function findRelevantChunks(questionVector: number[], topK = 4): Chunk[] {
  const scored = store.map((ec) => ({
    chunk: ec.chunk,
    score: cosineSimilarity(questionVector, ec.vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}