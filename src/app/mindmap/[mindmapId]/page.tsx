"use client";

import { Database } from "@/lib/database";
import { Background, Controls, ReactFlow, useNodesData, useReactFlow } from "@xyflow/react";
import type { Tables } from "@/lib/database";
import { useMemo, useCallback, useEffect, useState } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import "@xyflow/react/dist/style.css";

// 計算動態間距的輔助函數（基於實際節點尺寸）
function calculateDynamicSpacing(nodeIds: string[], getNode: any, minGap: number = 20): number {
  if (nodeIds.length === 0) return 120;

  let maxHeight = 40; // 默認最小高度

  // 獲取實際渲染的節點尺寸
  nodeIds.forEach((nodeId) => {
    const node = getNode(nodeId);
    if (node?.measured?.height) {
      maxHeight = Math.max(maxHeight, node.measured.height);
    }
  });

  // 動態間距 = 最大節點高度 + 最小間隔
  return Math.max(maxHeight + minGap, 80);
}

// 建立階層結構的輔助函數
function buildHierarchy(nodeId: number, nodes: Tables<"nodes">[], nodeMap: Map<number, Tables<"nodes">>): any {
  const node = nodeMap.get(nodeId);
  if (!node) return null;

  const children = nodes
    .filter((n) => (n.content as any)?.parentId === nodeId)
    .map((child) => buildHierarchy(child.id, nodes, nodeMap))
    .filter(Boolean);

  return {
    id: node.id,
    content: node.content,
    type: node.type,
    styles: node.styles,
    children: children.length > 0 ? children : undefined
  };
}

// 計算動態間距的輔助函數
function calculateSpacing(nodes: any[], minGap: number = 20): number {
  if (nodes.length === 0) return 120;

  // 計算最大節點高度
  const maxHeight = Math.max(...nodes.map((node) => estimateNodeSize(node).height));

  // 動態間距 = 最大節點高度 + 最小間隔
  return Math.max(maxHeight + minGap, 80);
}

// 估算節點大小的輔助函數
function estimateNodeSize(node: any): { width: number; height: number } {
  const label = (node.content as any)?.label || "";
  const styles = node.styles || {};

  // 基於字體大小和文字長度估算寬度
  const fontSize = parseInt(styles.fontSize || "14") || 14;
  const padding = styles.padding || "8px 16px";

  // 解析 padding
  const paddingValues = padding.split(" ");
  const verticalPadding = parseInt(paddingValues[0]) * 2 || 16;
  const horizontalPadding = parseInt(paddingValues[1] || paddingValues[0]) * 2 || 32;

  // 估算文字寬度（每個字符約為字體大小的 0.6 倍）
  const textWidth = label.length * fontSize * 0.6;
  const textHeight = fontSize;

  return {
    width: Math.max(textWidth + horizontalPadding, 80), // 最小寬度 80px
    height: Math.max(textHeight + verticalPadding, 40) // 最小高度 40px
  };
}

// 簡化的線性佈局函數
function layoutBranch(node: any, parentX: number, parentY: number, direction: { x: number; y: number }, distance: number, layoutNodes: any[], layoutEdges: any[], parentId?: string) {
  // 計算當前節點位置
  const x = parentX + direction.x * distance;
  const y = parentY + direction.y * distance;

  // 添加當前節點
  layoutNodes.push({
    id: node.data.id.toString(),
    type: "default",
    data: {
      label: (node.data.content as any).label
    },
    position: { x, y },
    style: node.data.styles || {}
  });

  // 如果有父節點，添加連接邊
  if (parentId) {
    layoutEdges.push({
      id: `e${parentId}-${node.data.id}`,
      source: parentId,
      target: node.data.id.toString(),
      type: "straight",
      style: { stroke: "#999", strokeWidth: 2 }
    });
  }

  // 處理子節點 - 沿著主分支方向進一步延伸
  if (node.children && node.children.length > 0) {
    const childDistance = 150; // 增加子節點距離

    if (node.children.length === 1) {
      // 只有一個子節點：與父節點同一水平線
      const child = node.children[0];
      const childX = x + direction.x * childDistance;
      const childY = y; // 與父節點同一 Y 座標

      // 添加子節點
      layoutNodes.push({
        id: child.data.id.toString(),
        type: "default",
        data: {
          label: (child.data.content as any).label
        },
        position: { x: childX, y: childY },
        style: child.data.styles || {}
      });

      // 連接到父節點
      layoutEdges.push({
        id: `e${node.data.id}-${child.data.id}`,
        source: node.data.id.toString(),
        target: child.data.id.toString(),
        type: "straight",
        style: { stroke: "#999", strokeWidth: 1.5 }
      });

      // 如果還有更深層的子節點，遞迴處理
      if (child.children && child.children.length > 0) {
        const grandChildDistance = 120;
        const grandChildSpacing = 100;
        const grandStartOffset = (-(child.children.length - 1) * grandChildSpacing) / 2;

        child.children.forEach((grandchild: any, gIndex: number) => {
          const grandOffset = grandStartOffset + gIndex * grandChildSpacing;
          // 對於孫節點，仍然使用垂直分佈
          const perpDirection = { x: -direction.y, y: direction.x };
          const grandChildX = childX + direction.x * grandChildDistance;
          const grandChildY = childY + perpDirection.y * grandOffset;

          layoutNodes.push({
            id: grandchild.data.id.toString(),
            type: "default",
            data: {
              label: (grandchild.data.content as any).label
            },
            position: { x: grandChildX, y: grandChildY },
            style: grandchild.data.styles || {}
          });

          layoutEdges.push({
            id: `e${child.data.id}-${grandchild.data.id}`,
            source: child.data.id.toString(),
            target: grandchild.data.id.toString(),
            type: "straight",
            style: { stroke: "#999", strokeWidth: 1 }
          });
        });
      }
    } else {
      // 多個子節點：以父節點為中心上下分佈
      const spacing = 120; // 增加節點間距

      // 計算起始位置，讓子節點以父節點 Y 為中心分佈
      const startOffset = (-(node.children.length - 1) * spacing) / 2;

      node.children.forEach((child: any, index: number) => {
        const offset = startOffset + index * spacing;
        // 子節點沿著主分支方向延伸，Y 座標以父節點為中心上下分佈
        const childX = x + direction.x * childDistance;
        const childY = y + offset;

        // 添加子節點
        layoutNodes.push({
          id: child.data.id.toString(),
          type: "default",
          data: {
            label: (child.data.content as any).label
          },
          position: { x: childX, y: childY },
          style: child.data.styles || {}
        });

        // 連接到父節點
        layoutEdges.push({
          id: `e${node.data.id}-${child.data.id}`,
          source: node.data.id.toString(),
          target: child.data.id.toString(),
          type: "straight",
          style: { stroke: "#999", strokeWidth: 1.5 }
        });

        // 如果還有更深層的子節點，遞迴處理
        if (child.children && child.children.length > 0) {
          const grandChildDistance = 120;
          const grandChildSpacing = 100;
          const grandStartOffset = (-(child.children.length - 1) * grandChildSpacing) / 2;

          child.children.forEach((grandchild: any, gIndex: number) => {
            const grandOffset = grandStartOffset + gIndex * grandChildSpacing;
            const grandChildX = childX + direction.x * grandChildDistance;
            const grandChildY = childY + grandOffset;

            layoutNodes.push({
              id: grandchild.data.id.toString(),
              type: "default",
              data: {
                label: (grandchild.data.content as any).label
              },
              position: { x: grandChildX, y: grandChildY },
              style: grandchild.data.styles || {}
            });

            layoutEdges.push({
              id: `e${child.data.id}-${grandchild.data.id}`,
              source: child.data.id.toString(),
              target: grandchild.data.id.toString(),
              type: "straight",
              style: { stroke: "#999", strokeWidth: 1 }
            });
          });
        }
      });
    }
  }
}

// 根據資料庫型別定義的範例物件
const exampleMindmap: Tables<"mindmaps"> = {
  id: 1,
  title: "學習計畫",
  created_at: new Date().toISOString(),
  owner_id: "user-123"
};

const exampleNodes: Tables<"nodes">[] = [
  {
    id: 1,
    mindmap_id: 1,
    content: { label: "Central Topic", parentId: null },
    styles: {
      background: "#1e293b",
      color: "white",
      border: "2px solid #334155",
      borderRadius: "8px",
      padding: "12px 24px",
      fontSize: "18px",
      fontWeight: "bold"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    mindmap_id: 1,
    content: { label: "Main Topic 4", parentId: 1 },
    styles: {
      background: "#10b981",
      color: "white",
      border: "2px solid #059669",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    mindmap_id: 1,
    content: { label: "Main Topic 3", parentId: 1 },
    styles: {
      background: "#ef4444",
      color: "white",
      border: "2px solid #dc2626",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    mindmap_id: 1,
    content: { label: "Main Topic 2", parentId: 1 },
    styles: {
      background: "#eab308",
      color: "white",
      border: "2px solid #ca8a04",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    mindmap_id: 1,
    content: { label: "This is a node", parentId: 1 },
    styles: {
      background: "#f97316",
      color: "white",
      border: "2px solid #ea580c",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    mindmap_id: 1,
    content: { label: "Subtopic 1", parentId: 2 },
    styles: {
      background: "#a7f3d0",
      color: "#065f46",
      border: "1px solid #6ee7b7",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "12px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    mindmap_id: 1,
    content: { label: "Subtopic 1", parentId: 3 },
    styles: {
      background: "#fecaca",
      color: "#7f1d1d",
      border: "1px solid #fca5a5",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "12px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    mindmap_id: 1,
    content: { label: "Subtopic 1", parentId: 4 },
    styles: {
      background: "#fef3c7",
      color: "#78350f",
      border: "1px solid #fde68a",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "12px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    mindmap_id: 1,
    content: { label: "Subtopic 1", parentId: 5 },
    styles: {
      background: "#fed7aa",
      color: "#9a3412",
      border: "1px solid #fdba74",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "12px"
    },
    type: "text",
    created_at: new Date().toISOString()
  }
];

interface MindmapRendererProps {
  mindmap: Tables<"mindmaps">;
  nodes: Tables<"nodes">[];
}

function MindmapRenderer({ mindmap, nodes }: MindmapRendererProps) {
  const [layoutVersion, setLayoutVersion] = useState(0);

  const { flowNodes, flowEdges } = useMemo(() => {
    // 建立節點查找表
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // 找出根節點（沒有 parentId 的節點）
    const rootNode = nodes.find((node) => !(node.content as any)?.parentId || (node.content as any)?.parentId === null);

    if (!rootNode) {
      return { flowNodes: [], flowEdges: [] };
    }

    const hierarchyData = buildHierarchy(rootNode.id, nodes, nodeMap);
    if (!hierarchyData) {
      return { flowNodes: [], flowEdges: [] };
    }

    // 使用 d3-hierarchy 建立樹狀結構
    const root = hierarchy(hierarchyData);

    const layoutNodes: any[] = [];
    const layoutEdges: any[] = [];

    // 中心位置
    const centerX = 400;
    const centerY = 300;

    // 添加根節點
    layoutNodes.push({
      id: root.data.id.toString(),
      type: "default",
      data: {
        label: (root.data.content as any).label
      },
      position: { x: centerX, y: centerY },
      style: root.data.styles || {}
    });

    // 主分支方向（優先左右，然後對角線方向）
    const mainDirections = [
      { x: 1, y: 0 }, // 右
      { x: -1, y: 0 }, // 左
      { x: 0.7, y: -0.7 }, // 右上
      { x: 0.7, y: 0.7 }, // 右下
      { x: -0.7, y: -0.7 }, // 左上
      { x: -0.7, y: 0.7 } // 左下
    ];

    // 佈局主分支
    if (root.children && root.children.length > 0) {
      const branchDistance = 300; // 增加主分支距離，避免重疊

      root.children.forEach((child: any, index: number) => {
        const direction = mainDirections[index % mainDirections.length];
        layoutBranch(child, centerX, centerY, direction, branchDistance, layoutNodes, layoutEdges, root.data.id.toString());
      });
    }

    return { flowNodes: layoutNodes, flowEdges: layoutEdges };
  }, [nodes, layoutVersion]);

  // 處理節點變化，當節點被測量後重新計算佈局
  const onNodesChange = useCallback((changes: any) => {
    const hasMeasurementChanges = changes.some((change: any) => change.type === "dimensions" && change.measured);

    if (hasMeasurementChanges) {
      // 延遲重新計算佈局，給節點測量一些時間
      setTimeout(() => {
        setLayoutVersion((prev) => prev + 1);
      }, 100);
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={flowNodes} edges={flowEdges} onNodesChange={onNodesChange} nodeOrigin={[0.5, 0.5]} fitView fitViewOptions={{ padding: 0.2 }}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function MindmapPage() {
  return <MindmapRenderer mindmap={exampleMindmap} nodes={exampleNodes} />;
}
