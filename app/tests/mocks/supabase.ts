// Mock Supabase client for tests
import { jest } from '@jest/globals';
import { Database } from '../../types/supabase';
import { UserSettings } from '../../services/settings';

// Define types for our mocks
type Tables = Database['public']['Tables'];
type SupabaseResponse<T> = { data: T | null; error: null | { message: string } };
type SessionResponse = { data: { session: { user: { id: string; email: string; role: string }; access_token: string; refresh_token: string; expires_at: number } } | null; error: null | { message: string } };
type UserResponse = { data: { user: { id: string; email: string; role: string } } | null; error: null | { message: string } };

// Mock settings data based on our Supabase schema
export const mockSettings: UserSettings = {
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

// Mock profile data
export const mockProfile: Tables['profiles']['Row'] = {
  id: mockSettings.user_id,
  name: 'Test User',
  bio: 'A test user for planetary hours',
  avatar_url: 'https://example.com/avatar.png',
  level: 1,
  experience: 0,
  streak_days: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock ritual log
export const mockRitualLog: Tables['ritual_logs']['Row'] = {
  id: 'test-ritual-log-id',
  user_id: mockSettings.user_id,
  ritual_id: 'planetary-hours-ritual',
  completed_at: new Date().toISOString(),
  notes: 'Test ritual completion',
  rating: 5,
  created_at: new Date().toISOString()
};

// Create a mock Supabase client
export const createMockSupabaseClient = () => {
  // Create properly typed mock functions
  const getSessionMock = jest.fn<() => Promise<SessionResponse>>().mockResolvedValue({
    data: {
      session: {
        user: { 
          id: mockSettings.user_id,
          email: 'test@example.com',
          role: 'authenticated'
        },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600
      }
    },
    error: null
  });

  const getUserMock = jest.fn<() => Promise<UserResponse>>().mockResolvedValue({
    data: { 
      user: {
        id: mockSettings.user_id,
        email: 'test@example.com',
        role: 'authenticated'
      }
    },
    error: null
  });

  // Create a type-safe mock for database operations
  const mockSupabase = {
    auth: {
      getSession: getSessionMock,
      getUser: getUserMock,
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn().mockImplementation((table: unknown) => {
      const tableName = String(table);
      // Create the select chain with proper types
      const selectFn = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn<() => Promise<SupabaseResponse<any>>>().mockResolvedValue({
          data: tableName === 'settings' ? mockSettings : 
               tableName === 'profiles' ? mockProfile : 
               tableName === 'ritual_logs' ? mockRitualLog : null,
          error: null
        })
      });

      // Create properly typed mock responses for database operations
      return {
        select: selectFn,
        insert: jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({ 
          data: [tableName === 'settings' ? mockSettings : 
                tableName === 'profiles' ? mockProfile : 
                tableName === 'ritual_logs' ? mockRitualLog : {}], 
          error: null 
        }),
        update: jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({ 
          data: [tableName === 'settings' ? mockSettings : 
                tableName === 'profiles' ? mockProfile : 
                tableName === 'ritual_logs' ? mockRitualLog : {}], 
          error: null 
        }),
        upsert: jest.fn<() => Promise<SupabaseResponse<any[]>>>().mockResolvedValue({ 
          data: [tableName === 'settings' ? mockSettings : 
                tableName === 'profiles' ? mockProfile : 
                tableName === 'ritual_logs' ? mockRitualLog : {}], 
          error: null 
        })
      };
    })
  };

  return mockSupabase;
};

// Export mock URL and key
export const mockSupabaseUrl = 'https://mock-supabase-url.com';
export const mockSupabaseAnonKey = 'mock-anon-key';
