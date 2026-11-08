import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from '../types';

const SESSION_KEY = 'travelie.session';
const isWeb = Platform.OS === 'web';

export async function readStoredSession(): Promise<Session | null> {
  try {
    const raw = isWeb ? globalThis.localStorage?.getItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export async function saveStoredSession(session: Session): Promise<void> {
  const raw = JSON.stringify(session);
  if (isWeb) {
    globalThis.localStorage?.setItem(SESSION_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, raw);
}

export async function clearStoredSession(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}