import {Platform} from 'react-native';
import * as Keychain from 'react-native-keychain';

import type {StoredTokens} from '../types/auth';

const SERVICE_NAME = 'simpleinvoice.auth';

const keychainOptions: Keychain.SetOptions = Platform.select({
  ios: {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  },
  android: {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    accessControl: Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD,
  },
  default: {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  },
}) as Keychain.SetOptions;

function serializeTokens(tokens: StoredTokens): string {
  return JSON.stringify(tokens);
}

function parseTokens(rawValue: string): StoredTokens | null {
  try {
    const parsed = JSON.parse(rawValue) as StoredTokens;

    if (!parsed.accessToken || !parsed.refreshToken) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword(
    'tokens',
    serializeTokens(tokens),
    {
      service: SERVICE_NAME,
      ...keychainOptions,
    },
  );
}

export async function getTokens(): Promise<StoredTokens | null> {
  const credentials = await Keychain.getGenericPassword({
    service: SERVICE_NAME,
    ...keychainOptions,
  });

  if (!credentials) {
    return null;
  }

  return parseTokens(credentials.password);
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({
    service: SERVICE_NAME,
    ...keychainOptions,
  });
}
