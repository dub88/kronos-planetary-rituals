import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const rawSupabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const rawSupabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const normalizeSupabaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed.replace(/\/+$/, '');
  return `https://${trimmed}`.replace(/\/+$/, '');
};

const resolvedSupabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const resolvedSupabaseAnonKey = rawSupabaseAnonKey?.trim();

const isJestTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;

const effectiveSupabaseUrl = resolvedSupabaseUrl || (isJestTestEnv ? 'https://mock-supabase-url.com' : undefined);
const effectiveSupabaseAnonKey = resolvedSupabaseAnonKey || (isJestTestEnv ? 'mock-anon-key' : undefined);

if (!effectiveSupabaseUrl) {
  throw new Error('Missing SUPABASE_URL in environment variables');
}

if (!effectiveSupabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY in environment variables');
}

export const supabaseUrl = effectiveSupabaseUrl;
export const supabaseAnonKey = effectiveSupabaseAnonKey;

// Create a custom storage adapter for AsyncStorage
const AsyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Check if we're in a browser environment where localStorage is available
const isLocalStorageAvailable = () => {
  try {
    if (typeof localStorage === 'undefined') return false;
    const testKey = '__supabase_ls_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Create a dummy storage for SSR environments
const dummyStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

// Determine which storage to use
const getStorage = () => {
  if (Platform.OS !== 'web') return AsyncStorageAdapter;
  return isLocalStorageAvailable() ? localStorage : dummyStorage;
};

// Create the Supabase client with platform-specific storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web' && isLocalStorageAvailable(),
  },
});
