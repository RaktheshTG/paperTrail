import React from "react";

export function highlightTerms(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;

  // build a regex that matches any of the terms (case-insensitive, whole word)
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark
            key={i}
            className="rounded px-0.5 bg-primary/20 text-primary font-medium not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}