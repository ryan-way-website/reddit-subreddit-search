export type Node = { id: number; label: string };
export type Link = { source: string; target: string };
export type GraphData = { nodes: Node[]; links: Link[] };
