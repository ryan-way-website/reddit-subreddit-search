export const ClientId = 'fEa8R-rPf6QEWZHxlvRcGA';
export const Secret = 'JWK8RzrT9zJrgwXhnv8OGQgqUYDCWA';
enum Domain {
  Data = 'https://oauth.reddit.com/',
  AccessToken = 'https://www.reddit.com/api/v1/access_token',
}

export enum Subreddit {
  AskReddit = 'askreddit',
}

export enum Endpoint {
  AccessToken = Domain.AccessToken,
  Me = `${Domain.Data}api/v1/me`,
  Scope = `${Domain.Data}api/v1/scopes`,
  Trophies = `${Domain.Data}api/v1/user/pocket_leper/trophies`,
  Subreddit = `${Domain.Data}r/askreddit/about`,
  SubredditHot = `${Domain.Data}r/askreddit/hot`,
  SubredditBest = `${Domain.Data}r/askreddit/best`,
}

export function getTopSubredditPostsEndpoint(subreddit: string) {
  return `${Domain.Data}r/${subreddit}/best?limit=100`;
}
