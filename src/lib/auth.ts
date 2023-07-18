import { ClientId, Secret, Endpoint } from '$lib/constants';

type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  scope: '*';
};

type Auth = {
  accessToken: string;
  tokenType: 'bearer';
  expiresAt: Date;
  scope: '*';
};

let cachedAuth: Auth;
let cachedOpts: RequestInit;

function getFetchAuthOpts() {
  if (!cachedOpts) {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(`${ClientId}:${Secret}`));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');

    cachedOpts = {
      method: 'POST',
      headers,
      body: body.toString(),
    };
  }

  return cachedOpts;
}

async function fetchAuth(): Promise<Auth> {
  return fetch(Endpoint.AccessToken, getFetchAuthOpts())
    .then((res) => res.json())
    .then((json) => {
      const authResponse = json as AuthResponse;
      const expiresNum = Date.now() + authResponse.expires_in;
      const expiresAt = new Date(expiresNum);
      return {
        accessToken: authResponse.access_token,
        tokenType: authResponse.token_type,
        expiresAt,
        scope: authResponse.scope,
      };
    });
}

function shouldRefresh() {
  return cachedAuth === undefined || new Date() >= cachedAuth.expiresAt;
}

export async function getAccessToken(): Promise<string> {
  if (shouldRefresh()) {
    cachedAuth = await fetchAuth();
  }

  return cachedAuth.accessToken;
}
