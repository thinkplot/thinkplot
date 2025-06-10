"use client";

import { Background, Controls, ReactFlow } from "@xyflow/react";
import type { Tables } from "@/lib/database";
import { useMemo } from "react";
import { generateFlowData } from "@/lib/mindmap/layout";
import { CenterNode } from "./CenterNode";
import "@xyflow/react/dist/style.css";

interface MindmapRendererProps {
  mindmap: Tables<"mindmaps">;
  nodes: Tables<"nodes">[];
}

/**
 * MindmapRenderer component for displaying interactive mindmaps
 *
 * A React component that renders a mindmap using ReactFlow library. It processes
 * hierarchical node data and displays it as an interactive flow diagram with
 * automatic layout and positioning.
 *
 * @param props - The component props
 * @param props.mindmap - Mindmap metadata from the database
 * @param props.nodes - Array of node data from the database to be rendered
 * @returns JSX element containing the full mindmap visualization with controls
 */
export function MindmapRenderer({ mindmap, nodes }: MindmapRendererProps) {
  const { flowNodes, flowEdges } = useMemo(() => generateFlowData(nodes), [nodes]);

  const nodeTypes = {
    centerNode: CenterNode
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} nodeOrigin={[0.5, 0.5]} fitView fitViewOptions={{ padding: 0.2 }}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
