import type { Tables } from "@/lib/database";
import { hierarchy } from "d3-hierarchy";

/**
 * Builds a hierarchical tree structure from flat node data
 *
 * Recursively constructs a tree structure starting from a given node ID,
 * including all its descendants in a nested hierarchy.
 *
 * @param nodeId - The ID of the node to start building the hierarchy from
 * @param nodes - Array of all nodes in the mindmap
 * @param nodeMap - Map for fast node lookup by ID
 * @returns Hierarchical node object with nested children, or null if node not found
 */
export function buildHierarchy(nodeId: number, nodes: Tables<"nodes">[], nodeMap: Map<number, Tables<"nodes">>): any {
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

/**
 * Creates a ReactFlow node object for layout positioning
 *
 * Transforms a hierarchical node into a ReactFlow-compatible node object
 * with proper positioning and connection point configuration.
 *
 * @param node - The hierarchical node data
 * @param x - X coordinate for the node position
 * @param y - Y coordinate for the node position
 * @param direction - Direction vector indicating layout flow {x: number, y: number}
 * @returns ReactFlow node object ready for rendering
 */
export function createLayoutNode(node: any, x: number, y: number, direction: { x: number; y: number }) {
  return {
    id: node.data.id.toString(),
    type: "default",
    data: {
      label: (node.data.content as any).label
    },
    position: { x, y },
    style: node.data.styles || {},
    sourcePosition: direction.x > 0 ? "right" : "left",
    targetPosition: direction.x > 0 ? "left" : "right"
  };
}

/**
 * Creates a ReactFlow edge object for connecting nodes
 *
 * Generates an edge configuration that connects two nodes with appropriate
 * positioning and styling based on the layout direction.
 *
 * @param sourceId - ID of the source node
 * @param targetId - ID of the target node
 * @param direction - Direction vector for determining connection points
 * @param strokeWidth - Width of the connection line (default: 1.5)
 * @returns ReactFlow edge object for connecting two nodes
 */
export function createLayoutEdge(sourceId: string, targetId: string, direction: { x: number; y: number }, strokeWidth: number = 1.5) {
  const sourcePosition = direction.x > 0 ? "right" : "left";
  const targetPosition = direction.x > 0 ? "left" : "right";

  return {
    id: `e${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: "straight",
    sourcePosition,
    targetPosition,
    style: { stroke: "#999", strokeWidth }
  };
}

/**
 * Calculates the space requirements for a branch and its descendants
 *
 * Recursively computes the width and height needed to layout a node and all
 * its children, accounting for level-based spacing adjustments.
 *
 * @param node - The hierarchical node to calculate space for
 * @param level - Current depth level in the hierarchy (default: 0)
 * @returns Object containing width and height requirements for the branch
 */
export function calculateBranchSpace(node: any, level: number = 0): { width: number; height: number } {
  if (!node.children || node.children.length === 0) {
    return { width: 150, height: 80 };
  }

  const childDistance = Math.max(120, 180 - level * 20);
  const spacing = Math.max(80, 120 - level * 20);

  if (node.children.length === 1) {
    const childSpace = calculateBranchSpace(node.children[0], level + 1);
    return {
      width: childDistance + childSpace.width,
      height: Math.max(80, childSpace.height)
    };
  }

  let maxChildWidth = 0;
  let accumulatedHeight = 0;

  node.children.forEach((child: any, index: number) => {
    const childSpace = calculateBranchSpace(child, level + 1);
    maxChildWidth = Math.max(maxChildWidth, childSpace.width);

    if (index === 0) {
      accumulatedHeight = childSpace.height;
    } else {
      accumulatedHeight += spacing + childSpace.height;
    }
  });

  return {
    width: childDistance + maxChildWidth,
    height: Math.max(80, accumulatedHeight)
  };
}

/**
 * Recursively layouts a branch and all its descendants
 *
 * Positions nodes in the layout space and creates connections between them.
 * Handles both single-child and multi-child scenarios with appropriate spacing.
 *
 * @param node - The hierarchical node to layout
 * @param parentX - X coordinate of the parent node
 * @param parentY - Y coordinate of the parent node
 * @param direction - Direction vector for layout flow
 * @param distance - Distance from parent node
 * @param layoutNodes - Array to accumulate positioned nodes
 * @param layoutEdges - Array to accumulate connections
 * @param parentId - ID of the parent node (optional)
 * @param level - Current depth level in the hierarchy (default: 0)
 */
export function layoutBranchWithSpace(
  node: any,
  parentX: number,
  parentY: number,
  direction: { x: number; y: number },
  distance: number,
  layoutNodes: any[],
  layoutEdges: any[],
  parentId?: string,
  level: number = 0
) {
  const x = parentX + direction.x * distance;
  const y = parentY + direction.y * distance;

  const currentNode = createLayoutNode(node, x, y, direction);
  layoutNodes.push(currentNode);

  if (parentId && level > 0) {
    const edge = createLayoutEdge(parentId, node.data.id.toString(), direction, level === 0 ? 2 : 1.5);
    layoutEdges.push(edge);
  }

  if (!node.children || node.children.length === 0) {
    return;
  }

  const childDistance = Math.max(120, 180 - level * 20);
  const spacing = Math.max(80, 120 - level * 20);

  if (node.children.length === 1) {
    const child = node.children[0];
    const childDirection = { x: direction.x > 0 ? 1 : -1, y: 0 };
    const childX = x + childDirection.x * childDistance;
    const childY = y;

    layoutBranchWithSpace(child, childX, childY, childDirection, 0, layoutNodes, layoutEdges, node.data.id.toString(), level + 1);
    return;
  }

  const startOffset = (-(node.children.length - 1) * spacing) / 2;
  const childDirection = { x: direction.x > 0 ? 1 : -1, y: 0 };
  const childX = x + childDirection.x * childDistance;

  node.children.forEach((child: any, index: number) => {
    const offset = startOffset + index * spacing;
    const childY = y + offset;

    layoutBranchWithSpace(child, childX, childY, childDirection, 0, layoutNodes, layoutEdges, node.data.id.toString(), level + 1);
  });
}

/**
 * Separates child branches into left and right groups for balanced layout
 *
 * Distributes branches alternately between left and right sides to create
 * a balanced mindmap appearance. Preserves original order for consistent layout.
 *
 * @param branchSpaces - Array of branch objects with child and space information
 * @returns Object containing separated rightBranches and leftBranches arrays
 */
export function separateBranches(branchSpaces: Array<{ child: any; space: any }>) {
  const rightBranches: any[] = [];
  const leftBranches: any[] = [];

  branchSpaces.forEach(({ child, space }, index) => {
    if (index % 2 === 0) {
      rightBranches.push({ child, space, originalIndex: index });
    } else {
      leftBranches.push({ child, space, originalIndex: index });
    }
  });

  return { rightBranches, leftBranches };
}

/**
 * Layouts all branches on one side (left or right) of the center node
 *
 * Positions all branches on a specified side with proper vertical spacing
 * and records their positions for later connection to the center node.
 *
 * @param branches - Array of branch objects to layout on this side
 * @param centerX - X coordinate of the center node
 * @param centerY - Y coordinate of the center node
 * @param isRight - Whether this is the right side (true) or left side (false)
 * @param layoutNodes - Array to accumulate positioned nodes
 * @param layoutEdges - Array to accumulate connections
 * @param primaryBranchPositions - Array to record branch positions for center connections
 */
export function layoutBranchSide(branches: any[], centerX: number, centerY: number, isRight: boolean, layoutNodes: any[], layoutEdges: any[], primaryBranchPositions: any[]) {
  if (branches.length === 0) return;

  const direction = { x: isRight ? 1 : -1, y: 0 };
  const offset = -(branches.reduce((sum, branch) => sum + branch.space.height, 0) + (branches.length - 1) * 50) / 2;

  branches.forEach(({ child, space, originalIndex }, branchIndex) => {
    const branchY = centerY + offset + branches.slice(0, branchIndex).reduce((sum, branch) => sum + branch.space.height + 50, 0) + space.height / 2;
    const branchDistance = Math.max(300, space.width * 0.3);
    const branchX = centerX + direction.x * branchDistance;

    primaryBranchPositions.push({
      childId: child.data.id.toString(),
      position: { x: branchX, y: branchY },
      isRight,
      originalIndex
    });

    layoutBranchWithSpace(child, centerX, branchY, direction, branchDistance, layoutNodes, layoutEdges, undefined, 0);
  });
}

/**
 * Creates connections between the center node and primary branches
 *
 * Establishes edges from the root node to all primary branches, using the
 * appropriate connection handles based on the relative positions.
 *
 * @param primaryBranchPositions - Array of branch position information
 * @param rootId - ID of the root/center node
 * @param centerX - X coordinate of the center node for handle selection
 * @param layoutEdges - Array to accumulate edge connections
 */
export function createPrimaryBranchConnections(primaryBranchPositions: any[], rootId: string, centerX: number, layoutEdges: any[]) {
  primaryBranchPositions
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .forEach(({ childId, position }) => {
      const childIsToTheRight = position.x > centerX;
      const rootSourceHandle = childIsToTheRight ? "right" : "left";
      const childTargetPosition = childIsToTheRight ? "left" : "right";

      const primaryBranchEdge = {
        id: `e${rootId}-${childId}`,
        source: rootId,
        target: childId,
        type: "straight",
        sourceHandle: rootSourceHandle,
        targetPosition: childTargetPosition,
        style: { stroke: "#999", strokeWidth: 2 }
      };

      layoutEdges.push(primaryBranchEdge);
    });
}

/**
 * Creates the root/center node for the mindmap layout
 *
 * Generates a ReactFlow node object for the central node with special
 * "centerNode" type to enable multiple connection handles.
 *
 * @param rootData - The hierarchical data for the root node
 * @param centerX - X coordinate for positioning the center node
 * @param centerY - Y coordinate for positioning the center node
 * @returns ReactFlow node object configured as the center node
 */
export function createRootNode(rootData: any, centerX: number, centerY: number) {
  return {
    id: rootData.id.toString(),
    type: "centerNode",
    data: {
      label: (rootData.content as any).label
    },
    position: { x: centerX, y: centerY },
    style: rootData.styles || {}
  };
}

/**
 * Generates complete ReactFlow data from database nodes
 *
 * Main orchestration function that converts flat database node records
 * into a complete ReactFlow-compatible layout with nodes and edges.
 * Handles the entire pipeline from hierarchy building to final positioning.
 *
 * @param nodes - Array of node records from the database
 * @returns Object containing flowNodes and flowEdges arrays for ReactFlow
 */
export function generateFlowData(nodes: Tables<"nodes">[]) {
  if (!nodes || nodes.length === 0) {
    return { flowNodes: [], flowEdges: [] };
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const rootNode = nodes.find((node) => !(node.content as any)?.parentId || (node.content as any)?.parentId === null);

  if (!rootNode) {
    return { flowNodes: [], flowEdges: [] };
  }

  const hierarchyData = buildHierarchy(rootNode.id, nodes, nodeMap);
  if (!hierarchyData) {
    return { flowNodes: [], flowEdges: [] };
  }

  const root = hierarchy(hierarchyData);
  const layoutNodes: any[] = [];
  const layoutEdges: any[] = [];
  const centerX = 400;
  const centerY = 300;

  // 添加根節點
  const rootNodeData = createRootNode(root.data, centerX, centerY);
  layoutNodes.push(rootNodeData);

  if (!root.children || root.children.length === 0) {
    return { flowNodes: layoutNodes, flowEdges: layoutEdges };
  }

  // 計算分支空間並分離左右
  const branchSpaces = root.children.map((child: any) => ({
    child,
    space: calculateBranchSpace(child)
  }));

  const { rightBranches, leftBranches } = separateBranches(branchSpaces);
  const primaryBranchPositions: any[] = [];

  // 佈局左右分支
  layoutBranchSide(rightBranches, centerX, centerY, true, layoutNodes, layoutEdges, primaryBranchPositions);
  layoutBranchSide(leftBranches, centerX, centerY, false, layoutNodes, layoutEdges, primaryBranchPositions);

  // 創建主分支連接
  createPrimaryBranchConnections(primaryBranchPositions, root.data.id.toString(), centerX, layoutEdges);

  return { flowNodes: layoutNodes, flowEdges: layoutEdges };
}
