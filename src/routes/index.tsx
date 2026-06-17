import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Copy, RotateCcw, FileText, Sparkles, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConceptMap } from "@/components/concept-map";
import { ChatSidebar } from "@/components/chat-sidebar";
import {
  DEMO_PAPER,
  DEMO_PAPERS,
  LOADING_MESSAGES,
  PLAIN_ENGLISH_SUMMARY,
  WHY_IT_MATTERS,
} from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaperTrail — Research, Explained." },
      { name: "description", content: "Paste any arXiv or PubMed URL and get a plain-English breakdown in seconds." },
    ],
  }),
  component: PaperTrail,
});

type AppState = "empty" | "loading" | "results";

function PaperTrail() {
  const [state, setState] = useState<AppState>("empty");
  const [url, setUrl] = useState("");
  const [loadingIdx, setLoadingIdx] = useState(0);

  useEffect(() => {
    if (state !== "loading") return;
    setLoadingIdx(0);
    const interval = setInterval(() => {
      setLoadingIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    const done = setTimeout(() => setState("results"), 3200);
    return () => {
      clearInterval(interval);
      clearTimeout(done);
    };
  }, [state]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    // TODO: REPLACE WITH GEMINI API CALL — fetch and parse PDF from arXiv/PubMed URL
    setState("loading");
  };

  const reset = () => {
    setState("empty");
    setUrl("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* URL bar — always visible */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="flex items-center gap-2 font-display text-base font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            PaperTrail
          </div>

          <form onSubmit={onSubmit} className="ml-4 flex flex-1 items-center gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={state === "loading"}
              placeholder="Paste an arXiv or PubMed URL..."
              className="h-10 flex-1 rounded-lg border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 disabled:opacity-60"
            />
            {state === "results" ? (
              <button
                type="button"
                onClick={reset}
                className="flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium transition hover:border-primary/40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try another paper
              </button>
            ) : (
              <button
                type="submit"
                disabled={state === "loading" || !url.trim()}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                Explain this Paper <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {state === "empty" && <EmptyState onPick={setUrl} />}
        {state === "loading" && <LoadingState message={LOADING_MESSAGES[loadingIdx]} />}
        {state === "results" && <ResultsState />}
      </main>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (url: string) => void }) {
  return (
    <section className="mx-auto max-w-3xl py-12 text-center animate-fade-in-up">
      <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
        Research, <span className="text-highlight">Explained.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
        Paste any research paper URL and get a plain-English breakdown in seconds.
      </p>

      <div className="mt-14 text-left">
        <div className="mb-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Or start with a classic
        </div>

        <div className="relative mx-auto max-w-xl">
          {/* Signature dotted trail */}
          <div className="trail-dotted absolute bottom-6 left-7 top-6 w-px" aria-hidden />

          <div className="space-y-3">
            {DEMO_PAPERS.map((p, i) => (
              <button
                key={p.url}
                onClick={() => onPick(p.url)}
                className="group relative flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-card/70"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-[10px] font-semibold text-highlight">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.authors}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-8 font-display text-lg font-medium">{message}</div>
      <div className="mt-6 max-w-md">
        <div className="font-display text-sm font-semibold text-highlight">{DEMO_PAPER.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{DEMO_PAPER.authors}</div>
      </div>
    </section>
  );
}

function ResultsState() {
  return (
    <div className="animate-fade-in-up">
      {/* Top bar */}
      <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Now reading</div>
          <h2 className="mt-1 font-display text-xl font-semibold">{DEMO_PAPER.title}</h2>
          <div className="mt-1 text-sm text-muted-foreground">{DEMO_PAPER.authors}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left — Insights Dashboard (60%) */}
        <div className="lg:col-span-3">
          <InsightsDashboard />
        </div>

        {/* Right — Chat (40%) */}
        <div className="lg:col-span-2">
          <div className="h-[680px] lg:sticky lg:top-24">
            <ChatSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function InsightsDashboard() {
  const [level, setLevel] = useState<"simpler" | "technical">("simpler");

  return (
    <div className="relative">
      {/* Signature trail line down the left column */}
      <div className="trail-dotted pointer-events-none absolute -left-3 top-12 bottom-4 hidden w-px md:block" aria-hidden />

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card">
          <TabsTrigger value="summary">Plain English Summary</TabsTrigger>
          <TabsTrigger value="map">Concept Map</TabsTrigger>
          <TabsTrigger value="why">Why It Matters</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setLevel((l) => (l === "simpler" ? "technical" : "simpler"))}
                className="rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {level === "simpler" ? "Simpler" : "More Technical"} ↔
              </button>
              <CopyButton text={PLAIN_ENGLISH_SUMMARY} />
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
              {PLAIN_ENGLISH_SUMMARY.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 px-2 text-xs text-muted-foreground">
              Click a node to see its definition. Drag to pan, scroll to zoom.
            </div>
            <ConceptMap />
          </div>
        </TabsContent>

        <TabsContent value="why" className="mt-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex justify-end">
              <CopyButton text={WHY_IT_MATTERS} />
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
              {WHY_IT_MATTERS.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
