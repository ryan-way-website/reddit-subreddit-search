import { getTopSubredditPostsEndpoint } from '$lib/constants';
import { writable, derived } from 'svelte/store';
import { getAccessToken } from './auth';

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

function fetchData(endpoint: string, access_token: string) {
  const headers = new Headers();
  headers.append('Authorization', `bearer ${access_token}`);
  const opts = {
    method: 'GET',
    headers,
  };
  return fetch(endpoint, opts);
}

export type Post = { title: string; subreddit: string; crossPostedTo: string };

function mapPostData(post: Data<PostData>): Post {
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

function isValidPostData(postData: Data<PostData>): boolean {
  return postData.data.crosspost_parent_list !== undefined;
}

function processData(listing: SubredditListing): Post[] {
  const { children } = listing.data;
  return children
    .filter((postData) => isValidPostData(postData))
    .map((postData) => mapPostData(postData));
}

const subredditStore = writable('SweatyPalms');
const postsStore = derived(
  subredditStore,
  (subreddit: string, set) => {
    const endpoint = getTopSubredditPostsEndpoint(subreddit);
    set(
      getAccessToken()
        .then((accessToken) => fetchData(endpoint, accessToken))
        .then((res) => res.json())
        .then((json: SubredditListing) => processData(json)),
    );
  },
  [],
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
