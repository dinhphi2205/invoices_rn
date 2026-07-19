import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

import {env} from '../config/env';
import {notifySessionExpired} from './authEvents';
import {getTokens, saveTokens} from './tokenStorage';
import {refreshAccessToken, logout} from './authService';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

async function getRefreshedAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then(session => session.accessToken)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    
    const tokens = await getTokens();

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    if (tokens?.orgToken) {
      config.headers['org-token'] = tokens.orgToken;
    }

    return config;
  },
  error => Promise.reject(error),
);

createAuthRefreshInterceptor(
  apiClient,
  async (failedRequest: AxiosError) => {
    try {
      const accessToken = await getRefreshedAccessToken();
      const tokens = await getTokens();

      if (failedRequest.response?.config?.headers) {
        failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;

        if (tokens?.orgToken) {
          failedRequest.response.config.headers['org-token'] = tokens.orgToken;
        }
      }

      return Promise.resolve();
    } catch {
      await logout();
      notifySessionExpired();
      return Promise.reject(failedRequest);
    }
  },
  {
    statusCodes: [401],
  },
);

export async function updateStoredOrgToken(orgToken: string): Promise<void> {
  const tokens = await getTokens();

  if (!tokens) {
    return;
  }

  await saveTokens({
    ...tokens,
    orgToken,
  });
}
