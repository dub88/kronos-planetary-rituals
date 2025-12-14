import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location } from '@/types';
import * as ExpoLocation from 'expo-location';
import { Platform } from 'react-native';

interface LocationState {
  location: Location | null;
  hasPromptedForLocation: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLocation: (location: Location) => void;
  clearLocation: () => void;
  setHasPromptedForLocation: (hasPrompted: boolean) => void;
  fetchLocation: () => Promise<void>;
  updateLocation: (location: Location) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      hasPromptedForLocation: false,
      isLoading: false,
      error: null,
      
      setLocation: (location) => {
        set({ 
          location,
          hasPromptedForLocation: true,
          error: null
        });
      },
      
      clearLocation: () => {
        set({ location: null });
      },
      
      setHasPromptedForLocation: (hasPrompted) => {
        set({ hasPromptedForLocation: hasPrompted });
      },
      
      fetchLocation: async () => {
        try {
          set({ isLoading: true, error: null });
          
          if (Platform.OS === 'web') {
            // Web implementation
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  set({
                    location: {
                      latitude,
                      longitude,
                      name: 'Current Location',
                    },
                    isLoading: false,
                  });
                },
                (err) => {
                  console.error('Error getting location on web:', err);
                  set({ 
                    error: 'Could not get your location. Please try again.',
                    isLoading: false
                  });
                }
              );
            } else {
              set({ 
                error: 'Geolocation is not supported by this browser.',
                isLoading: false
              });
            }
          } else {
            // Native implementation
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
              set({ 
                error: 'Permission to access location was denied',
                isLoading: false
              });
              return;
            }
            
            const location = await ExpoLocation.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            // Get location name (reverse geocoding)
            try {
              const geocode = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
              const locationName = geocode[0]?.city || geocode[0]?.region || 'Current Location';
              
              set({
                location: {
                  latitude,
                  longitude,
                  name: locationName,
                  city: geocode[0]?.city ?? undefined,
                  country: geocode[0]?.country ?? undefined,
                },
                isLoading: false,
              });
            } catch (geocodeError) {
              console.error('Error getting location name:', geocodeError);
              // Still set location even if reverse geocoding fails
              set({
                location: {
                  latitude,
                  longitude,
                  name: 'Current Location',
                },
                isLoading: false,
              });
            }
          }
        } catch (err) {
          console.error('Error fetching location:', err);
          set({ 
            error: 'Could not get your location. Please try again.',
            isLoading: false
          });
        }
      },
      
      updateLocation: (location) => {
        set({ location });
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);