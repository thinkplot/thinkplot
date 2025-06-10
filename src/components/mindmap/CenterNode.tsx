import { Handle, Position } from "@xyflow/react";

interface CenterNodeProps {
  data: {
    label: string;
  };
  style?: React.CSSProperties;
}

/**
 * CenterNode component for mindmap visualization
 *
 * A specialized React Flow node component that serves as the central node in a mindmap.
 * Features left and right connection handles to allow branching in both directions.
 *
 * @param props - The component props
 * @param props.data - Node data containing the label to display
 * @param props.data.label - The text content to display in the center of the node
 * @param props.style - Optional CSS styles to apply to the node container
 * @returns JSX element representing the center node with connection handles
 */
export function CenterNode({ data, style }: CenterNodeProps) {
  return (
    <div style={style}>
      <Handle type="source" position={Position.Left} id="left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ right: -8 }} />
      <div style={{ padding: "8px 16px" }}>{data.label}</div>
    </div>
  );
}
