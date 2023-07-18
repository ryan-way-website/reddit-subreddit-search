<script lang="ts">
  import { update, set, subreddit, posts } from '$lib/stores';
  import { type Post } from '$lib/stores';
  import { type Node, type Link, type GraphData } from '$lib/types';
  import Graph from '$lib/components/graph.svelte';

  type Event<T> = { detail: T };

  let breadCrumbs: string[] = [];

  let search: string = '';

  function unique<T>(list: T[]): T[] {
    return [...new Set([...list]).values()];
  }

  let graphData: GraphData;
  posts.subscribe(async (resp) => {
    const data = await resp;
    const linkedSubreddits = unique(data.map((post: Post) => post.crossPostedTo));
    const nodes = [$subreddit, ...linkedSubreddits].map((sub, index) => {
      return {
        id: index,
        label: sub,
        group: index,
      };
    });
    const links = linkedSubreddits.map((sub, index) => {
      return {
        source: index + 1,
        target: 0,
      };
    });

    graphData = {
      nodes,
      links,
    };
  });

  async function onClick() {
    breadCrumbs = [...breadCrumbs, $subreddit];
    set(search);
  }

  async function onNodeClick(e: Event<Node>) {
    breadCrumbs = [...breadCrumbs, $subreddit];
    set(e.detail.label);
  }

  async function onBreadCrumbClick(breadCrumb) {
    breadCrumbs.splice(breadCrumbs.indexOf(breadCrumb), 1);
    breadCrumbs = [...breadCrumbs];
    set(breadCrumb);
  }
</script>

<span>
  <label>Search:</label>
  <input type="text" placeholder={$subreddit} bind:value={search} />
  <button on:click={onClick}>Go</button>
</span>

<div>
  {#await $posts}
    <p>...loading</p>
  {:then posts}
    <Graph {graphData} on:onNodeClick={onNodeClick} />
    <bread-crumb>
      {#each breadCrumbs as breadCrumb}
        <span
          on:click={() => {
            onBreadCrumbClick(breadCrumb);
          }}>{breadCrumb}</span
        >
      {/each}
    </bread-crumb>
  {:catch}
    ERROR!
  {/await}
</div>

<style lang="postcss">
  h1 {
    @apply m-20;
    @apply text-3xl;
  }
  p {
    @apply text-2xl;
  }
  div {
    border-color: black;
    border-width: 1px;
    height: 100%;
    width: 100%;
  }

  label {
    margin-left: 10px;
    margin-right: 10px;
  }
</style>
