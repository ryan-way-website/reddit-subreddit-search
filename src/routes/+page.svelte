<script lang="ts">
  import { set, subreddit, posts as postStore } from '$lib/stores/reddit.ts';
  import type { Node, GraphData, Post } from '$lib/types';
  import Graph from '$lib/components/graph.svelte';
  import { getGraphdataStore } from './page';

  type Event<T> = { detail: T };

  let breadCrumbs: string[] = [];

  $: {
    console.log('Subreddit change:', $subreddit);
    breadCrumbs = [...breadCrumbs, $subreddit];
  }

  let search = '';

  subreddit.subscribe((val) => (search = val));

  let graphData = getGraphdataStore(postStore, subreddit);

  async function onClick() {
    breadCrumbs = [...breadCrumbs, $subreddit];
    set(search);
  }

  async function onNodeClick(e: Event<Node>) {
    console.log('Event:', JSON.stringify(e));
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

{#await $postStore}
  <div class="w-full flex items-center justify-center" style="height: 1000px">
    <span class="loading loading-spinner loading-lg" />
  </div>
{:then _}
  <Graph graphData={$graphData} on:onNodeClick={onNodeClick} />
{:catch}
  ERROR!
{/await}

<style lang="postcss">
</style>
