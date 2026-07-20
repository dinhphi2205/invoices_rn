jest.mock('react-native-config', () => ({
  WSO2_TOKEN_URL: 'https://example.com/oauth2/token',
  API_BASE_URL: 'https://example.com',
  CLIENT_ID: 'client-id',
  CLIENT_SECRET: 'client-secret',
}));

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
  ACCESS_CONTROL: {
    APPLICATION_PASSWORD: 'APPLICATION_PASSWORD',
  },
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

const Keychain = require('react-native-keychain');

Keychain.getGenericPassword.mockResolvedValue(false);
Keychain.setGenericPassword.mockResolvedValue(undefined);
Keychain.resetGenericPassword.mockResolvedValue(undefined);
