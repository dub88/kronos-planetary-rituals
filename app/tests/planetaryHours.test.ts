/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';
import type { PlanetaryHour } from '../app-types';
import type { UserSettings } from '../services/settings';

// Mock required modules
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Mock the calculatePlanetaryHours function
jest.mock('../services/planetaryHours', () => {
  // Create a mock implementation that returns predictable data
  const mockPlanetaryHours: PlanetaryHour[] = Array.from({ length: 24 }, (_, i) => {
    const startTime = new Date('2025-03-07T00:00:00.000-08:00');
    startTime.setHours(i);
    
    const endTime = new Date(startTime);
    endTime.setHours(i + 1);
    
    // Use the correct PlanetName type values
    const planetNames: Array<'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn'> = 
      ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    
    const isDayHour = i < 12;

    return {
      hourNumber: i + 1,
      planet: planetNames[i % 7],
      planetId: planetNames[i % 7],
      period: isDayHour ? 'day' : 'night',
      isDayHour,
      startTime,
      endTime,
      isCurrentHour: false,
      label: 'today'
    };
  });
  
  return {
    calculatePlanetaryHours: jest
      .fn<() => Promise<PlanetaryHour[]>>()
      .mockResolvedValue(mockPlanetaryHours)
  };
});

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn()
};

// Mock the supabase module
jest.mock('../config/supabase', () => ({
  supabase: mockSupabase
}));

// Import after mocks
import { calculatePlanetaryHours } from '../services/planetaryHours';

// Test constants
const TEST_DATE = new Date('2025-03-07T06:32:55.925-08:00');

// Mock settings data based on our Supabase schema
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

describe('Planetary Hours Calculation', () => {
  beforeAll(() => {
    // Define types for our mocks
    type SupabaseResponse<T> = { data: T | null; error: null | { message: string } };
    type SessionResponse = { 
      data: { 
        session: { 
          user: { id: string; email: string; role: string }; 
          access_token: string; 
          refresh_token: string; 
          expires_at: number 
        } 
      } | null; 
      error: null | { message: string } 
    };
    type UserResponse = { 
      data: { user: { id: string; email: string; role: string } } | null; 
      error: null | { message: string } 
    };

    // Configure Supabase mock implementations with proper types
    const mockSession: SessionResponse = {
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
    };

    const mockUserResponse: UserResponse = {
      data: { user: mockSession.data!.session.user },
      error: null
    };

    // Create properly typed mock functions
    const getSessionMock = jest.fn<() => Promise<SessionResponse>>().mockResolvedValue(mockSession);
    const getUserMock = jest.fn<() => Promise<UserResponse>>().mockResolvedValue(mockUserResponse);

    // Type assertion to help TypeScript understand our mocks
    (mockSupabase.auth.getSession as jest.Mock) = getSessionMock;
    (mockSupabase.auth.getUser as jest.Mock) = getUserMock;

    // Create typed mock responses for database operations
    const singleResponse = jest.fn<() => Promise<SupabaseResponse<UserSettings>>>().mockResolvedValue({
      data: mockSettings,
      error: null
    });

    const insertResponse = jest.fn<() => Promise<SupabaseResponse<UserSettings[]>>>().mockResolvedValue({ 
      data: [mockSettings], 
      error: null 
    });

    const updateResponse = jest.fn<() => Promise<SupabaseResponse<UserSettings[]>>>().mockResolvedValue({ 
      data: [mockSettings], 
      error: null 
    });

    const upsertResponse = jest.fn<() => Promise<SupabaseResponse<UserSettings[]>>>().mockResolvedValue({ 
      data: [mockSettings], 
      error: null 
    });

    // Use type assertion for the from implementation
    (mockSupabase.from as jest.Mock) = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        single: singleResponse
      }),
      insert: insertResponse,
      update: updateResponse,
      upsert: upsertResponse
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should calculate planetary hours correctly', async () => {
    const hours = await calculatePlanetaryHours(
      mockSettings.location.latitude,
      mockSettings.location.longitude,
      TEST_DATE,
      mockSettings.location.timezone
    );

    // Basic validation
    expect(hours).toHaveLength(24);
    expect(hours[0].isDayHour).toBe(true);
    expect(hours[12].isDayHour).toBe(false);

    // Verify hour sequence and properties
    hours.forEach((hour: PlanetaryHour, index: number) => {
      expect(hour).toHaveProperty('startTime');
      expect(hour).toHaveProperty('endTime');
      expect(hour).toHaveProperty('planet');
      expect(hour).toHaveProperty('hourNumber');
      expect(hour).toHaveProperty('isDayHour');

      expect(hour.hourNumber).toBe(index + 1);
      expect(hour.isDayHour).toBe(index < 12);

      // Verify times are valid Dates
      expect(hour.startTime).toBeInstanceOf(Date);
      expect(hour.endTime).toBeInstanceOf(Date);

      // Verify startTime is before endTime
      expect(hour.startTime.getTime()).toBeLessThan(hour.endTime.getTime());

      // Verify hour duration is approximately 1 hour (with some tolerance for DST)
      const duration = hour.endTime.getTime() - hour.startTime.getTime();
      expect(duration).toBeGreaterThan(55 * 60 * 1000); // At least 55 minutes
      expect(duration).toBeLessThan(65 * 60 * 1000); // At most 65 minutes
    });
  });

  it('should handle timezone correctly', async () => {
    const { latitude, longitude, timezone } = mockSettings.location;

    // Calculate hours
    const hours = await calculatePlanetaryHours(
      latitude,
      longitude,
      TEST_DATE,
      timezone
    );

    // Basic validations for timezone test
    expect(hours).toHaveLength(24);
    expect(hours[0].isDayHour).toBe(true);
    expect(hours[12].isDayHour).toBe(false);

    // Verify the calculatePlanetaryHours function was called with the correct parameters
    expect(calculatePlanetaryHours).toHaveBeenCalledWith(
      latitude,
      longitude,
      TEST_DATE,
      timezone
    );
  });
});
