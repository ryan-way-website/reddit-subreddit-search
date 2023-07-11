<script lang="ts">
  const endpoint = 'https://oauth.reddit.com/';

  enum Endpoint {
    Me = `${endpoint}api/v1/me`,
    Scope = `${endpoint}api/v1/scopes`,
    Trophies = `${endpoint}api/v1/user/pocket_leper/trophies`,
    Subreddit = `${endpoint}r/askreddit/about`,
    SubredditHot = `${endpoint}r/askreddit/hot`,
    SubredditBest = `${endpoint}r/askreddit/best`,
  }
  async function fetchAccessToken() {
    const client_id = 'fEa8R-rPf6QEWZHxlvRcGA';
    const secret = 'JWK8RzrT9zJrgwXhnv8OGQgqUYDCWA';
    const reddit_auth_url = 'https://www.reddit.com/api/v1/access_token';

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(`${client_id}:${secret}`));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const opts = {
      method: 'POST',
      headers,
      body: 'grant_type=client_credentials',
    };

    return fetch(reddit_auth_url, opts)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json.access_token;
      });
  }

  async function fetchData(access_token: string) {
    const endpoint = Endpoint.SubredditBest;
    const headers = new Headers();
    headers.append('Authorization', `bearer ${access_token}`);
    const opts = {
      method: 'GET',
      headers,
    };
    return fetch(endpoint, opts);
  }

  const response = fetchAccessToken().then(async (access_token) => {
    const body = await fetchData(access_token).then((res) => {
      return res.json();
    });
    console.log('Data: ', body.data);
    return body.data;
  });
</script>

<h1 class="text-3xl font-bold underline my-20">Hello World!</h1>

{#await response}
  ..loading
{:then data}
  {JSON.stringify(data)}
{:catch err}
  ERROR: {err}
{/await}

<style lang="postcss">
</style>
