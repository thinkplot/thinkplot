import { Background, Controls, ReactFlow } from "@xyflow/react";

export default function MindmapPage() {
  const mindmaps = {};

  const nodes = [
    {
      id: 1,
      created_at: new Date().toISOString(),
      mindmap_id: 1001,
      content: {
        text: "Root Node"
      },
      styles: {
        node: { color: "#333", background: "#fff" },
        edge: { color: "#aaa" }
      },
      type: "text"
    }
  ];

  return (
    <ReactFlow>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
