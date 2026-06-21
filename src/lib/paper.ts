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
  const cleanedOfMath = text
  .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")        // removes things like \epsilon{ls}
  .replace(/[a-zA-Z]+subscript[^\s]+/g, "")     // removes "dksubscript..." patterns
  .replace(/×10\^?\d+/g, "")                     // removes scientific notation artifacts
  .replace(/[a-zA-Z]+superscript[^\s]+/g, "")    // NEW: catches "superscript" pattern too
  .replace(/\\[a-zA-Z]+/g, "");                  // removes remaining LaTeX commands like \alpha

  const trimmed = cleanedOfMath.replace(/\s+/g, " ").trim().slice(0, 80000);

  return { title, text: trimmed };
}

// Extracts a PMID or PMCID from a PubMed/PMC URL
export function extractPubMedId(url: string): { type: "pmid" | "pmcid"; id: string } | null {
  const pmcMatch = url.match(/PMC(\d+)/i);
  if (pmcMatch) return { type: "pmcid", id: `PMC${pmcMatch[1]}` };

  const pmidMatch = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i);
  if (pmidMatch) return { type: "pmid", id: pmidMatch[1] };

  return null;
}

// Fetches and extracts plain text from a PubMed/PMC paper
export async function fetchPubMedText(url: string): Promise<{ title: string; text: string }> {
  const parsed = extractPubMedId(url);
  if (!parsed) {
    throw new Error("Invalid PubMed URL. Please paste a URL like https://pubmed.ncbi.nlm.nih.gov/12345678 or a PMC link.");
  }

  // EFetch requires a PMC ID — if we only have a PMID, we'll still try, but PMC IDs work best
  const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${parsed.id.replace("PMC", "")}&rettype=full&retmode=xml`;

  const res = await fetch(efetchUrl);
  if (!res.ok) {
    throw new Error("Could not fetch the paper from PubMed Central.");
  }

  const xml = await res.text();

  // check if we actually got article content (PMC returns an error message in XML if not open access)
  if (xml.includes("<error>") || xml.length < 500) {
    throw new Error("This paper isn't available in PubMed Central's open access subset. Try the original journal site or a different paper.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const title = doc.querySelector("article-title")?.textContent?.trim() || "Unknown Title";

  // grab all paragraph text from the body
  const paragraphs = Array.from(doc.querySelectorAll("body p"))
    .map((p) => p.textContent?.trim())
    .filter(Boolean);

  const text = paragraphs.join(" ").replace(/\s+/g, " ").trim().slice(0, 80000);

  if (text.length < 200) {
    throw new Error("Couldn't extract readable text from this paper.");
  }

  return { title, text };
}

// Detects the source and routes to the correct fetcher
export async function fetchAnyPaper(url: string): Promise<{ title: string; text: string }> {
  if (url.includes("arxiv.org")) {
    return fetchPaperText(url);
  }
  if (url.includes("pubmed.ncbi.nlm.nih.gov") || url.includes("pmc.ncbi.nlm.nih.gov")) {
    return fetchPubMedText(url);
  }
  throw new Error("Unsupported URL. PaperTrail currently supports arXiv and PubMed Central links.");
}