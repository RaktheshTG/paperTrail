import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { DEMO_CHAT } from "@/lib/demo-data";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatSidebar() {
  const [messages, setMessages] = useState<Msg[]>(DEMO_CHAT);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    // TODO: REPLACE WITH GEMINI API CALL — answer follow-up question grounded in paper
    // TODO: REPLACE WITH VECTOR DB — store and retrieve paper chunks for RAG
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "{{CHAT_RESPONSE}} — This is a demo response. Wire this up to the Gemini API with RAG over the paper's contents.",
        },
      ]);
    }, 600);
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
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "max-w-[85%] rounded-xl rounded-bl-sm border bg-muted px-3 py-2 text-sm text-foreground"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:border-primary/60">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this paper..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          Powered by AI
        </div>
      </form>
    </aside>
  );
}
