import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Copy, RotateCcw, FileText, Sparkles, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConceptMap } from "@/components/concept-map";
import { ChatSidebar } from "@/components/chat-sidebar";
import { fetchPaperText } from "@/lib/paper";
import { generateSummary, generateWhyItMatters, generateConceptMap } from "@/lib/groq";
import { DEMO_PAPERS, LOADING_MESSAGES } from "@/lib/demo-data";
import "@/lib/embeddings";


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

export type PaperData = {
  title: string;
  text: string;
  summary: string;
  whyItMatters: string;
  conceptMap: {
    nodes: { id: string; label: string; definition: string }[];
    edges: { from: string; to: string; label: string }[];
  };
};

function PaperTrail() {
  const [state, setState] = useState<AppState>("empty");
  const [url, setUrl] = useState("");
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setState("loading");

    try {
      setLoadingMsg("Fetching the paper...");
      const { title, text } = await fetchPaperText(url);

      setLoadingMsg("Writing the summary...");
      const summary = await generateSummary(text);

      setLoadingMsg("Explaining why it matters...");
      const whyItMatters = await generateWhyItMatters(text);

      setLoadingMsg("Mapping key concepts...");
      const conceptMap = await generateConceptMap(text);

      setPaperData({ title, text, summary, whyItMatters, conceptMap });
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("empty");
    }
  };

  const reset = () => {
    setState("empty");
    setUrl("");
    setPaperData(null);
    setError(null);
  };

  useEffect(() => {
    if (state !== "loading") return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 1400);
    return () => clearInterval(interval);
  }, [state]);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {state === "empty" && <EmptyState onPick={setUrl} />}
        {state === "loading" && <LoadingState message={loadingMsg} />}
        {state === "results" && paperData && (
          <ResultsState paperData={paperData} onReset={reset} />
        )}
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
          <div className="trail-dotted absolute bottom-6 left-7 top-6 w-px" aria-hidden />
          <div className="space-y-3">
            {DEMO_PAPERS.map((p, i) => (
              <button
                key={p.url}
                onClick={() => onPick(p.url)}
                className="group relative flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-card/70"
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
    </section>
  );
}

function ResultsState({ paperData, onReset }: { paperData: PaperData; onReset: () => void }) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Now reading</div>
          <h2 className="mt-1 font-display text-xl font-semibold">{paperData.title}</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm transition hover:border-primary/40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Try another
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <InsightsDashboard paperData={paperData} />
        </div>
        <div className="lg:col-span-2">
          <div className="h-[680px] lg:sticky lg:top-24">
            <ChatSidebar paperText={paperData.text} />
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

function InsightsDashboard({ paperData }: { paperData: PaperData }) {
  return (
    <div className="relative">
      <div className="trail-dotted pointer-events-none absolute -left-3 top-12 bottom-4 hidden w-px md:block" aria-hidden />
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card">
          <TabsTrigger value="summary">Plain English Summary</TabsTrigger>
          <TabsTrigger value="map">Concept Map</TabsTrigger>
          <TabsTrigger value="why">Why It Matters</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex justify-end">
              <CopyButton text={paperData.summary} />
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
              {paperData.summary.split("\n\n").map((p, i) => (
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
            <ConceptMap data={paperData.conceptMap} />
          </div>
        </TabsContent>

        <TabsContent value="why" className="mt-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex justify-end">
              <CopyButton text={paperData.whyItMatters} />
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
              {paperData.whyItMatters.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}