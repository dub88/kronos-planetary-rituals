// Set environment variables before any imports
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.com';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

import { jest } from '@jest/globals';
import type { UserSettings } from '../services/settings';

// Define types for our mocks
type SupabaseResponse<T> = { data: T | null; error: null | { message: string } };
type SessionResponse = { data: { session: { user: { id: string }; access_token: string; refresh_token: string } } | null; error: null | { message: string } };

// Mock React Native URL polyfill
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve())
}));

// Mock Supabase client with authenticated user and settings
const mockSettings: UserSettings = {
  user_id: 'test-user-id',
  dark_mode: true,
  notifications: true,
  auto_detect_location: false,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles'
  },
  sound_enabled: true,
  haptic_feedback_enabled: true,
  language: 'en',
  units: 'metric',
  theme: 'dark',
  font_size: 'medium'
};

jest.mock('@supabase/supabase-js', () => {
  // Create properly typed mock functions
  const getSessionMock = jest.fn<() => Promise<SessionResponse>>().mockResolvedValue({
    data: {
      session: {
        user: { id: mockSettings.user_id },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token'
      }
    },
    error: null
  });

  const selectMock = jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({
    data: [mockSettings],
    error: null
  });

  const insertMock = jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({
    data: [],
    error: null
  });

  const updateMock = jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({
    data: [],
    error: null
  });

  const upsertMock = jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({
    data: [],
    error: null
  });

  return {
    createClient: jest.fn(() => ({
      auth: {
        getSession: getSessionMock
      },
      from: jest.fn().mockImplementation((table: unknown) => {
        const tableName = String(table);
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis()
          }),
          insert: insertMock,
          update: updateMock,
          upsert: upsertMock,
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis()
        };
      })
    }))
  };
});

// Mock luxon DateTime for consistent testing
jest.mock('luxon', () => {
  const mockDate = new Date('2025-03-07T06:32:55.925-08:00');
  return {
    DateTime: {
      fromJSDate: jest.fn(() => ({
        setZone: jest.fn(() => ({
          toJSDate: jest.fn(() => mockDate),
          toISO: jest.fn(() => mockDate.toISOString()),
          plus: jest.fn(({ minutes }) => {
            const newDate = new Date(mockDate);
            newDate.setMinutes(newDate.getMinutes() + minutes);
            return {
              toJSDate: () => newDate,
              toISO: () => newDate.toISOString()
            };
          }),
          diff: jest.fn(() => ({ minutes: 720 })),
          weekday: 1
        }))
      })),
      fromObject: jest.fn(() => ({
        setZone: jest.fn(() => ({
          toJSDate: jest.fn(() => mockDate),
          toISO: jest.fn(() => mockDate.toISOString())
        }))
      }))
    }
  };
});
