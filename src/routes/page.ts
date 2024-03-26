import type { GraphData, Link, Node, Post } from '$lib/types';
import { unique } from '$lib/utils';
import { derived, type Readable } from 'svelte/store';

function getLinkedSubredditsStore(postStore: Readable<Promise<Post[]>>) {
  return derived<Readable<Promise<Post[]>>, string[]>(
    postStore,
    (postsPromise, set) => {
      postsPromise.then((posts) => {
        set(unique(posts.map((post: Post) => post.crossPostedTo)));
      });
    },
    [],
  );
}

function getNodeStore(linkedSubredditsStore: Readable<string[]>, subredditStore: Readable<string>) {
  return derived<[Readable<string[]>, Readable<string>], Node[]>(
    [linkedSubredditsStore, subredditStore],
    ([linkedSubreddits, subreddit], set) => {
      const nodes = [subreddit, ...linkedSubreddits].map((sub, index) => {
        return {
          id: index,
          label: sub,
          group: index,
        };
      });
      set(nodes);
    },
    [],
  );
}

function getLinksStore(linkedSubredditsStore: Readable<string[]>) {
  return derived<Readable<string[]>, Link[]>(
    linkedSubredditsStore,
    (linkedSubreddits, set) => {
      const links = linkedSubreddits.map((_, index) => {
        return {
          source: index + 1,
          target: 0,
        };
      });
      set(links);
    },
    [],
  );
}

export function getGraphdataStore(
  postStore: Readable<Promise<Post[]>>,
  subredditStore: Readable<string>,
) {
  const linkedSubredditsStore = getLinkedSubredditsStore(postStore);
  const linksStore = getLinksStore(linkedSubredditsStore);
  const nodeStore = getNodeStore(linkedSubredditsStore, subredditStore);
  return derived<[Readable<Node[]>, Readable<Link[]>], GraphData>(
    [nodeStore, linksStore],
    ([nodes, links], set) => {
      set({ nodes, links });
    },
    { nodes: [], links: [] },
  );
}
