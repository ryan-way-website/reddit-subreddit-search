import { getTopSubredditPostsEndpoint } from '$lib/constants';
import { writable, derived } from 'svelte/store';
import { getAccessToken } from '../auth';
import { cached } from '../utils';
import type { Post } from '$lib/types';

type Data<T> = {
  data: T;
};

type CrossPostData = {
  subreddit: string;
};

type PostData = {
  subreddit: string;
  title: string;
  crosspost_parent_list: CrossPostData[];
};

type Subreddit = {
  children: Data<PostData>[];
};

type SubredditListing = Data<Subreddit>;

async function fetchRedditData(endpoint: string, access_token: string) {
  const headers = new Headers();
  headers.append('Authorization', `bearer ${access_token}`);
  const opts = {
    method: 'GET',
    headers,
  };

  return cached<SubredditListing>(endpoint, async (key) => {
    return fetch(key, opts).then((result) => result.json()).then((result) => result as SubredditListing);
  });
}


function parsePostData(post: Data<PostData>): Post {
  const { data } = post;
  const title = data.title;
  const subreddit = data.subreddit;
  const crosspost_parent_list = data.crosspost_parent_list;
  const crossPostedTo =
    crosspost_parent_list === undefined ? '' : crosspost_parent_list[0].subreddit;

  return {
    title,
    subreddit,
    crossPostedTo,
  };
}

function isCrossPost(postData: Data<PostData>): boolean {
  return postData.data.crosspost_parent_list !== undefined && postData.data.crosspost_parent_list.length > 0;
}

function parseListingData(listingData: SubredditListing): Post[] {
  const { children } = listingData.data;
  return children
    .filter(isCrossPost)
    .map(parsePostData);
}

const subredditStore = writable('SweatyPalms');
const postsStore = derived(
  subredditStore,
  (subreddit: string, set) => {
    const endpoint = getTopSubredditPostsEndpoint(subreddit);
    const result = getAccessToken()
    .then(async (accessToken) => {
      const listingData = await fetchRedditData(endpoint, accessToken);
      return parseListingData(listingData);
    });
    set(result);
  },
  Promise.resolve([] as Post[]),
);

export const update = subredditStore.update;
export const set = subredditStore.set;
export const subreddit = { subscribe: subredditStore.subscribe };
export const posts = { subscribe: postsStore.subscribe };

export default {
  update: subredditStore.update,
  subreddit: { subscribe: subredditStore.subscribe },
  posts: { subscribe: postsStore.subscribe },
  set: subredditStore.set,
};
