"use client";

import { MindmapRenderer } from "@/components/mindmap/MindmapRenderer";
import { exampleMindmap, exampleNodes } from "@/lib/mindmap/sample-data";

/**
 * Mindmap page component for displaying a specific mindmap
 *
 * This page component renders a mindmap visualization using sample data.
 * In a real application, this would fetch data based on the mindmapId parameter.
 *
 * @returns JSX element containing the mindmap renderer with sample data
 */
export default function MindmapPage() {
  return <MindmapRenderer mindmap={exampleMindmap} nodes={exampleNodes} />;
}
