import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";

type ConceptMapData = {
  nodes: { id: string; label: string; definition: string }[];
  edges: { from: string; to: string; label: string }[];
};

function buildGraph(data: ConceptMapData) {
  const center = data.nodes[0];
  const others = data.nodes.slice(1);
  const radius = 200;

  const nodes: Node[] = [
    {
      id: center.id,
      data: { label: center.label },
      position: { x: 0, y: 0 },
      style: { background: "#7C6AF7", color: "#fff", borderColor: "#7C6AF7", fontWeight: 600 },
    },
    ...others.map((n, i) => {
      const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: n.id,
        data: { label: n.label },
        position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
      } satisfies Node;
    }),
  ];

  const edges: Edge[] = data.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.from,
    target: e.to,
    label: e.label,
    labelStyle: { fill: "#8885A0", fontSize: 11 },
    labelBgStyle: { fill: "#0F1117" },
    style: { stroke: "rgba(196,185,255,0.45)" },
  }));

  return { nodes, edges };
}

export function ConceptMap({ data }: { data: ConceptMapData }) {
  const graph = useMemo(() => buildGraph(data), [data]);
  const [selected, setSelected] = useState<{ label: string; definition: string } | null>(null);

  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    const found = data.nodes.find((n) => n.id === node.id);
    if (found) setSelected({ label: found.label, definition: found.definition });
  }, [data]);

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl border bg-background">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="rgba(255,255,255,0.06)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-10 rounded-lg border bg-card/95 p-3 backdrop-blur animate-fade-in-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-sm font-semibold text-highlight">{selected.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{selected.definition}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}