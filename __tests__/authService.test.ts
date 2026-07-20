import axios from 'axios';

import { login, refreshAccessToken } from '../src/services/authService';
import * as tokenStorage from '../src/services/tokenStorage';

jest.mock('axios');
jest.mock('../src/services/tokenStorage');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores tokens and org token after login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: { memberships: [{ token: 'org-token' }] },
      },
    });

    mockedTokenStorage.saveTokens.mockResolvedValue(undefined);

    const session = await login({
      username: 'username',
      password: 'password',
    });

    expect(session).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      orgToken: 'org-token',
    });

    expect(mockedTokenStorage.saveTokens).toHaveBeenCalledWith(session);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://example.com/oauth2/token',
      {
        client_id: 'client-id',
        client_secret: 'client-secret',
        grant_type: 'password',
        password: 'password',
        scope: 'openid',
        username: 'username',
      },
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );
  });

  it('refreshes access token using stored refresh token', async () => {
    mockedTokenStorage.getTokens.mockResolvedValueOnce({
      accessToken: 'old-access-token',
      refreshToken: 'refresh-token',
      orgToken: 'org-token',
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    });

    mockedTokenStorage.saveTokens.mockResolvedValue(undefined);

    const session = await refreshAccessToken();

    expect(session.accessToken).toBe('new-access-token');
    expect(session.orgToken).toBe('org-token');
    expect(mockedTokenStorage.saveTokens).toHaveBeenCalledWith(session);
  });
});
