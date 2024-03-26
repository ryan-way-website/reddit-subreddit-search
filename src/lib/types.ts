export type Node = { id: number; label: string };
export type Link = { source: number; target: number };
export type GraphData = { nodes: Node[]; links: Link[] };

export type Post = { title: string; subreddit: string; crossPostedTo: string };
