<script lang="ts">
  import { update, set, subreddit, posts } from '$lib/stores';
  import { type Post } from '$lib/stores';
  import { type Node, type Link, type GraphData } from '$lib/types';
  import Graph from '$lib/components/graph.svelte';

  type Event<T> = { detail: T };

  let breadCrumbs: string[] = [];
  subreddit.subscribe((val) => {
    console.log(val);
    breadCrumbs = [...breadCrumbs, val];
  });

  let search = '';

  subreddit.subscribe((val) => (search = val));

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
    set(e.detail.label);
  }

  async function onBreadCrumbClick(idx: number) {
    const breadCrumb = breadCrumbs[idx];
    if (breadCrumb === $subreddit) return;
    breadCrumbs.splice(idx);
    breadCrumbs = [...breadCrumbs];
    set(breadCrumb);
  }
</script>

<div class="navbar bg-neutral text-primary-content">
  <div class="navbar-start" />
  <div class="navbar-center">
    <input
      class="input input-bordered input-primary max-w-xs mx-5"
      type="text"
      bind:value={search}
    />
    <button class="btn btn-primary" on:click={onClick}>Go</button>
  </div>
  <div class="navbar-end" />
</div>

<div class="text-sm breadcrumbs">
  <ul>
    {#each breadCrumbs as breadCrumb, idx}
      <li
        on:click={() => {
          onBreadCrumbClick(idx);
        }}
      >
        {breadCrumb}
      </li>
    {/each}
  </ul>
</div>

{#await $posts}
  <div class="w-full flex items-center justify-center" style="height: 1000px">
    <span class="loading loading-spinner loading-lg" />
  </div>
{:then posts}
  <Graph {graphData} on:onNodeClick={onNodeClick} />
{:catch}
  ERROR!
{/await}

<style lang="postcss">
</style>
