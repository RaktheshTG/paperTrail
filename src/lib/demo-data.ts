// Mock demo data for "Attention Is All You Need"
// TODO: REPLACE WITH GEMINI API CALL — fetch and parse PDF from arXiv/PubMed URL
export const DEMO_PAPER = {
  title: "Attention Is All You Need",
  authors: "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin (2017)",
  url: "https://arxiv.org/abs/1706.03762",
};

// TODO: REPLACE WITH GEMINI API CALL — generate plain English summary
export const PLAIN_ENGLISH_SUMMARY = `Before this paper, the best language models worked like assembly lines — reading text one word at a time, in order. That sequential design made them slow to train and bad at remembering things from earlier in a long passage.

The authors proposed an entirely new architecture called the Transformer. Instead of processing words one after another, it looks at every word in a sentence simultaneously and figures out, for each word, which other words it should pay attention to. This trick — called self-attention — is the core idea.

By stacking many of these attention layers together, the Transformer could capture relationships between distant words far better than the older recurrent networks. It also trains much faster because the work can be done in parallel on modern GPUs.

The result was a model that beat the state of the art on translation tasks while training in a fraction of the time. More importantly, the Transformer became the blueprint for nearly every major AI model that followed — BERT, GPT, T5, and the entire generation of large language models powering today's AI assistants.`;

// TODO: REPLACE WITH GEMINI API CALL — generate why it matters section
export const WHY_IT_MATTERS = `This paper is arguably the most influential machine learning paper of the last decade. The Transformer architecture it introduced is the foundation of ChatGPT, Claude, Gemini, and essentially every modern large language model. Without this work, the AI revolution of the 2020s would look completely different.

Beyond language, the same attention mechanism has been adapted for image recognition, protein folding, code generation, music, and video. It turned out that "paying attention to the right things" is a remarkably general idea — one that scales gracefully as you add more data and compute.

For anyone curious about how today's AI systems actually work under the hood, this is the paper where it all started.`;

// TODO: REPLACE WITH GEMINI API CALL — extract concept map nodes and edges as JSON
export const CONCEPT_MAP_DATA = {
  nodes: [
    { id: "transformer", label: "Transformer", definition: "A neural network architecture built entirely on attention, with no recurrence." },
    { id: "attention", label: "Attention Mechanism", definition: "Lets the model weigh how much each input element matters to every other one." },
    { id: "multihead", label: "Multi-Head Attention", definition: "Runs attention many times in parallel to capture different kinds of relationships." },
    { id: "positional", label: "Positional Encoding", definition: "Injects word-order information since attention itself is order-agnostic." },
    { id: "encoder", label: "Encoder", definition: "Reads the input and produces a rich representation for each token." },
    { id: "decoder", label: "Decoder", definition: "Generates the output sequence one token at a time, attending to the encoder." },
  ],
  edges: [
    { from: "transformer", to: "attention", label: "built on" },
    { from: "attention", to: "multihead", label: "scaled to" },
    { from: "transformer", to: "positional", label: "uses" },
    { from: "transformer", to: "encoder", label: "contains" },
    { from: "transformer", to: "decoder", label: "contains" },
    { from: "encoder", to: "decoder", label: "feeds" },
  ],
};

// TODO: REPLACE WITH GEMINI API CALL — answer follow-up question grounded in paper
// TODO: REPLACE WITH VECTOR DB — store and retrieve paper chunks for RAG
export const DEMO_CHAT = [
  {
    role: "user" as const,
    content: "What was wrong with RNNs that made this paper necessary?",
  },
  {
    role: "assistant" as const,
    content:
      "RNNs process text sequentially — word by word — which means they can't be parallelized well on GPUs and they tend to forget information from earlier in long sequences. The Transformer fixes both problems by looking at all words at once through self-attention.",
  },
  {
    role: "user" as const,
    content: "Why is it called \"multi-head\" attention?",
  },
  {
    role: "assistant" as const,
    content:
      "Instead of computing attention once, the model runs it in parallel through several independent \"heads.\" Each head can learn to focus on a different type of relationship — like syntax in one head and meaning in another — and the results are combined.",
  },
];

export const DEMO_PAPERS = [
  { title: "Attention Is All You Need", authors: "Vaswani et al., 2017", url: "https://arxiv.org/abs/1706.03762" },
  { title: "BERT", authors: "Devlin et al., 2018", url: "https://arxiv.org/abs/1810.04805" },
  { title: "GPT-4 Technical Report", authors: "OpenAI, 2023", url: "https://arxiv.org/abs/2303.08774" },
];

export const LOADING_MESSAGES = [
  "Fetching the paper...",
  "Reading through the pages...",
  "Extracting key concepts...",
  "Almost ready...",
];
