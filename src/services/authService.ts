import axios from 'axios';

import { env } from '../config/env';
import type {
  AuthSession,
  LoginCredentials,
  TokenResponse,
  UserProfile,
} from '../types/auth';
import { clearTokens, getTokens, saveTokens } from './tokenStorage';

function buildTokenRequestBody(params: Record<string, string>): any {
  return {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    grant_type: 'password',
    scope: 'openid',
    ...params,
  };
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(env.wso2TokenUrl, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

export async function fetchUserProfile(
  accessToken: string,
): Promise<UserProfile> {
  const response = await axios.get<{ data: UserProfile }>(
    `${env.apiBaseUrl}/membership-service/1.0.0/users/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data.data;
}

function extractOrgToken(profile: UserProfile): string {
  const orgToken = profile.memberships?.[0]?.token;

  if (!orgToken) {
    throw new Error('Unable to resolve organisation token from user profile.');
  }

  return orgToken;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const body = buildTokenRequestBody({
    username: credentials.username.trim(),
    password: credentials.password,
  });

  const tokenResponse = await requestToken(body);
  const profile = await fetchUserProfile(tokenResponse.access_token);
  const orgToken = extractOrgToken(profile);

  const session: AuthSession = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    orgToken,
  };

  await saveTokens(session);

  return session;
}

export async function refreshAccessToken(): Promise<AuthSession> {
  const storedTokens = await getTokens();

  if (!storedTokens?.refreshToken) {
    throw new Error('No refresh token available.');
  }

  const body = buildTokenRequestBody({
    grant_type: 'refresh_token',
    refresh_token: storedTokens.refreshToken,
  });

  const tokenResponse = await requestToken(body);
  const orgToken = extractOrgToken(await fetchUserProfile(tokenResponse.access_token));

  const session: AuthSession = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? storedTokens.refreshToken,
    orgToken,
  };

  await saveTokens(session);

  return session;
}

export async function restoreSession(): Promise<AuthSession | null> {
  const storedTokens = await getTokens();

  if (!storedTokens?.accessToken || !storedTokens.refreshToken) {
    return null;
  }

  if (storedTokens.orgToken) {
    return {
      accessToken: storedTokens.accessToken,
      refreshToken: storedTokens.refreshToken,
      orgToken: storedTokens.orgToken,
    };
  }

  try {
    const profile = await fetchUserProfile(storedTokens.accessToken);
    const orgToken = extractOrgToken(profile);
    const session: AuthSession = {
      accessToken: storedTokens.accessToken,
      refreshToken: storedTokens.refreshToken,
      orgToken,
    };

    await saveTokens(session);

    return session;
  } catch {
    try {
      return await refreshAccessToken();
    } catch {
      await clearTokens();
      return null;
    }
  }
}

export async function logout(): Promise<void> {
  await clearTokens();
}
