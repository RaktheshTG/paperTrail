// Extracts the arXiv ID from any arXiv URL format
export function extractArxivId(url: string): string | null {
  // handles both:
  // https://arxiv.org/abs/1706.03762
  // https://arxiv.org/pdf/1706.03762
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]+\.[0-9]+)/i);
  return match ? match[1] : null;
}

// Fetches and extracts plain text from an arXiv paper
export async function fetchPaperText(url: string): Promise<{ title: string; text: string }> {
  const id = extractArxivId(url);

  if (!id) {
    throw new Error("Invalid arXiv URL. Please paste a URL like https://arxiv.org/abs/1706.03762");
  }

    // using allorigins.win
    const ar5ivUrl = `https://ar5iv.org/html/${id}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(ar5ivUrl)}`;
    const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error("Could not fetch the paper. Make sure the arXiv ID is correct.");
  }

    const html = await res.text();


  // use the browser's built-in HTML parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // extract title
  const title =
    doc.querySelector("h1.ltx_title")?.textContent?.trim() ||
    doc.querySelector("title")?.textContent?.trim() ||
    "Unknown Title";

  // remove elements we don't want (references, scripts, nav)
  doc.querySelectorAll("section.ltx_bibliography, script, style, nav, footer").forEach((el) => el.remove());

  // get the main article text
  const article = doc.querySelector("article") || doc.body;
  const text = article.innerText || article.textContent || "";

  // trim to first 12000 characters — Groq has a token limit
  // 12000 chars ≈ 3000 tokens, well within free tier limits
  const trimmed = text.replace(/\s+/g, " ").trim().slice(0, 80000);

  return { title, text: trimmed };
}