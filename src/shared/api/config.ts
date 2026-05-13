import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_CONFIG = {
  BASE_URL: extra.apiUrl    ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  WS_URL:   extra.wsUrl     ?? process.env.EXPO_PUBLIC_WS_URL  ?? 'ws://localhost:8080/ws',
  TIMEOUT:  15_000,
} as const;
