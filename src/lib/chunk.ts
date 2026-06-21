export type Chunk = {
  id: string;
  text: string;
  index: number;
  totalChunks: number;
  page?: number; // only present for PDF uploads
};

// Splits text into overlapping chunks
// chunkSize and overlap are measured in characters (rough proxy for tokens)
export function chunkText(text: string, chunkSize = 1500, overlap = 200): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkContent = text.slice(start, end);

    chunks.push({
      id: `chunk-${index}`,
      text: chunkContent,
      index,
      totalChunks: 0, // placeholder, fixed below
    });

    index++;
    // move start forward by (chunkSize - overlap) so chunks overlap
    start += chunkSize - overlap;
  }

    chunks.forEach((c) => (c.totalChunks = chunks.length));

  return chunks;
}


// Given a chunk's character position and a page map, find which page it starts on
export function findPageForChunk(
  chunkStartChar: number,
  pageMap: { page: number; startChar: number; endChar: number }[]
): number | undefined {
  const match = pageMap.find((p) => chunkStartChar >= p.startChar && chunkStartChar < p.endChar);
  return match?.page;
}