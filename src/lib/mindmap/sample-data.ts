import type { Tables } from "@/lib/database";

// 根據資料庫型別定義的範例物件
export const exampleMindmap: Tables<"mindmaps"> = {
  id: 1,
  title: "學習計畫",
  created_at: new Date().toISOString(),
  owner_id: "user-123"
};

export const exampleNodes: Tables<"nodes">[] = [
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
  },
  {
    id: 10,
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
  },
  // 第三層節點 - 測試深層嵌套
  {
    id: 11,
    mindmap_id: 1,
    content: { label: "Sub-sub topic A", parentId: 6 },
    styles: {
      background: "#d1fae5",
      color: "#047857",
      border: "1px solid #a7f3d0",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "11px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 12,
    mindmap_id: 1,
    content: { label: "Sub-sub topic B", parentId: 6 },
    styles: {
      background: "#d1fae5",
      color: "#047857",
      border: "1px solid #a7f3d0",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "11px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 13,
    mindmap_id: 1,
    content: { label: "詳細項目 1", parentId: 9 },
    styles: {
      background: "#ffedd5",
      color: "#9a3412",
      border: "1px solid #fed7aa",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "11px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 14,
    mindmap_id: 1,
    content: { label: "詳細項目 2", parentId: 9 },
    styles: {
      background: "#ffedd5",
      color: "#9a3412",
      border: "1px solid #fed7aa",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "11px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 15,
    mindmap_id: 1,
    content: { label: "詳細項目 3", parentId: 10 },
    styles: {
      background: "#ffedd5",
      color: "#9a3412",
      border: "1px solid #fed7aa",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "11px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  // 第四層節點 - 測試更深層嵌套
  {
    id: 16,
    mindmap_id: 1,
    content: { label: "深層子項目 A", parentId: 11 },
    styles: {
      background: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #d1fae5",
      borderRadius: "3px",
      padding: "3px 6px",
      fontSize: "10px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 17,
    mindmap_id: 1,
    content: { label: "深層子項目 B", parentId: 11 },
    styles: {
      background: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #d1fae5",
      borderRadius: "3px",
      padding: "3px 6px",
      fontSize: "10px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 18,
    mindmap_id: 1,
    content: { label: "最終細節 1", parentId: 13 },
    styles: {
      background: "#fef7ed",
      color: "#9a3412",
      border: "1px solid #ffedd5",
      borderRadius: "3px",
      padding: "3px 6px",
      fontSize: "10px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 19,
    mindmap_id: 1,
    content: { label: "最終細節 2", parentId: 13 },
    styles: {
      background: "#fef7ed",
      color: "#9a3412",
      border: "1px solid #ffedd5",
      borderRadius: "3px",
      padding: "3px 6px",
      fontSize: "10px"
    },
    type: "text",
    created_at: new Date().toISOString()
  },
  {
    id: 20,
    mindmap_id: 1,
    content: { label: "最終細節 3", parentId: 13 },
    styles: {
      background: "#fef7ed",
      color: "#9a3412",
      border: "1px solid #ffedd5",
      borderRadius: "3px",
      padding: "3px 6px",
      fontSize: "10px"
    },
    type: "text",
    created_at: new Date().toISOString()
  }
];
