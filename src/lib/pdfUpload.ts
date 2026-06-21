import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractTextFromPdf(file: File): Promise<{
  title: string;
  text: string;
  pageMap: { page: number; startChar: number; endChar: number }[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  const pageMap: { page: number; startChar: number; endChar: number }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");

    const startChar = fullText.length;
    fullText += pageText + " ";
    const endChar = fullText.length;

    pageMap.push({ page: pageNum, startChar, endChar });
  }

  const text = fullText.replace(/\s+/g, " ").trim().slice(0, 80000);

  // use the filename (without extension) as a fallback title
  const title = file.name.replace(/\.pdf$/i, "");

  if (text.length < 200) {
    throw new Error("Couldn't extract readable text from this PDF. It might be a scanned image without selectable text.");
  }

  return { title, text, pageMap };
}