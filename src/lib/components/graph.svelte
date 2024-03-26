<script lang="ts">
  import ForceGraph, { type LinkObject, type NodeObject } from 'force-graph';
  import type { GraphData, Node } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let graphData: GraphData;

  function onNodeClick(node: Node) {
    dispatch('onNodeClick', node);
  }

  let myGraph;

  function nodePaint(node, color: string, ctx, globalScale) {
    const label = graphData.nodes[node.id as number].label;
    const fontSize = 36 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

    ctx.fillStyle = 'rgba(255, 255, 255, 0.0)';
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = node.color;
    ctx.fillText(label, node.x, node.y);

    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
  }

  $: {
    const graph = document.getElementById('graph');
    if (graph && graphData) {
      myGraph = ForceGraph()(graph)
        .graphData(graphData)
        .height(1000)
        .nodeAutoColorBy('group')
        .nodeCanvasObject((node, ctx, globalScale) => nodePaint(node, '', ctx, globalScale))
        .nodePointerAreaPaint((node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions &&
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions,
            );
        })
        .onNodeClick(onNodeClick)
        .nodeId('id')
        .nodeLabel('label')
        .linkSource('source')
        .linkAutoColorBy('group')
        .zoom(10)
        .linkTarget('target');
      myGraph.onLinkClick(myGraph.emitParticle);
    }
  }
</script>

<div id="graph" />

<style>
</style>
