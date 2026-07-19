import Config from 'react-native-config';

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  wso2TokenUrl: requireEnv(Config.WSO2_TOKEN_URL, 'WSO2_TOKEN_URL'),
  apiBaseUrl: requireEnv(Config.API_BASE_URL, 'API_BASE_URL'),
  clientId: requireEnv(Config.CLIENT_ID, 'CLIENT_ID'),
  clientSecret: requireEnv(Config.CLIENT_SECRET, 'CLIENT_SECRET'),
};
