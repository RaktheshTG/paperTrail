const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;
const COHERE_URL = "https://api.cohere.com/v1/embed";

// Takes an array of text strings, returns an array of vectors (one per text)
export async function getEmbeddings(texts: string[], inputType: "search_document" | "search_query"): Promise<number[][]> {
  const res = await fetch(COHERE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      texts,
      model: "embed-english-v3.0",
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "Cohere API error");
  }

  const data = await res.json();
  return data.embeddings;
}

// TEMP TEST
// getEmbeddings(["The cat sat on the mat", "Attention mechanisms in transformers"], "search_document")
//   .then((vecs) => {
//     console.log("Number of vectors:", vecs.length);
//     console.log("Vector dimensions:", vecs[0].length);
//     console.log("First 5 numbers of vector 1:", vecs[0].slice(0, 5));
//   })
//   .catch(console.error);