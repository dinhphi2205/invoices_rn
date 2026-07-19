declare module 'react-native-config' {
  export interface NativeConfig {
    WSO2_TOKEN_URL?: string;
    API_BASE_URL?: string;
    CLIENT_ID?: string;
    CLIENT_SECRET?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
