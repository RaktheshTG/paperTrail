export type Chunk = {
  id: string;
  text: string;
  index: number;
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
    });

    index++;
    // move start forward by (chunkSize - overlap) so chunks overlap
    start += chunkSize - overlap;
  }

  return chunks;
}


