export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  orgToken?: string;
}

export interface UserMembership {
  token?: string;
}

export interface UserProfile {
  memberships?: UserMembership[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  orgToken: string;
}
