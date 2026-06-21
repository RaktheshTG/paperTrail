import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { askQuestion } from "@/lib/groq";


function formatMessage(content: string) {
  const parts = content.split("[BEYOND THE PAPER]");
  const paperPart = parts[0].trim();
  const beyondPart = parts[1]?.trim();

  const paragraphs = paperPart.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="leading-relaxed">{p}</p>
      ))}
      {beyondPart && (
        <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Beyond the paper
          </div>
          <div className="space-y-2">
            {beyondPart.split("\n\n").filter(Boolean).map((p, i) => (
              <p key={i} className="leading-relaxed text-foreground/80">{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Msg = { role: "user" | "assistant"; content: string; sources?: import("@/lib/chunk").Chunk[] };

export function ChatSidebar({
  namespace,
  onSourcesUpdate,
}: {
  namespace: string;
  onSourcesUpdate?: (sources: import("@/lib/chunk").Chunk[]) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi! I've read this paper. Ask me anything about it — I'll explain it in plain English.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: q }]);

    try {
      const { answer, sources } = await askQuestion(q,namespace,messages);
      setMessages((m) => [...m, { role: "assistant", content: answer, sources }]);
      onSourcesUpdate?.(sources);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="flex h-full flex-col rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="font-display text-sm font-semibold">Ask the Paper</div>
          <div className="text-[11px] text-muted-foreground">Grounded in the source</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={
              m.role === "user"
                ? "max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
                : "max-w-[85%] rounded-xl rounded-bl-sm border bg-muted px-4 py-3 text-sm text-foreground"
            }>
              {m.role === "assistant" ? formatMessage(m.content) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:border-primary/60">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this paper..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          Powered by Groq
        </div>
      </form>
    </aside>
  );
}