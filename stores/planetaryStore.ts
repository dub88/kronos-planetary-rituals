import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlanetaryHour as AppPlanetaryHour } from '../app/app-types';
import { PlanetDay, PlanetId, PlanetaryHour as TypesPlanetaryHour, PlanetaryPosition as TypesPlanetaryPosition } from '../types';
import { getPlanetaryDayRuler } from '../utils/planetaryHours';
import { calculatePlanetaryHours } from '../app/services/planetaryHours';
import { getCurrentPlanetaryPositions } from '../app/services/astrology';

// Define PlanetaryPosition interface for internal use
interface PlanetaryPosition extends TypesPlanetaryPosition {
  planet: PlanetId;
  sign: string;
  degree: number;
  isRetrograde: boolean;
}

interface PlanetaryState {
  hours: TypesPlanetaryHour[];
  currentDayRuler: PlanetDay;
  currentHour: TypesPlanetaryHour | null;
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  planetPositions: PlanetaryPosition[];
  
  // Actions
  fetchPlanetaryHours: (latitude?: number, longitude?: number) => Promise<void>;
  updateCurrentHour: () => void;
  fetchPlanetaryPositions: (latitude?: number, longitude?: number) => Promise<void>;
}

export const usePlanetaryStore = create<PlanetaryState>()(
  persist(
    (set, get) => ({
      hours: [],
      currentDayRuler: 'sun',
      currentHour: null,
      lastUpdated: null,
      isLoading: false,
      error: null,
      planetPositions: [],
      
      fetchPlanetaryHours: async (latitude, longitude) => {
        set({ isLoading: true, error: null });

        const mapHour = (hour: AppPlanetaryHour): TypesPlanetaryHour => ({
          hour: hour.hourNumber,
          hourNumber: hour.hourNumber,
          planet: hour.planet as PlanetDay,
          planetId: hour.planet as PlanetDay,
          period: hour.period,
          isDay: hour.isDayHour,
          startTime: hour.startTime,
          endTime: hour.endTime,
          isCurrentHour: hour.isCurrentHour,
          isDayHour: hour.isDayHour,
        });
        
        try {
          // Get the current day's planetary ruler
          const dayRuler = getPlanetaryDayRuler();
          
          // Get timezone from system
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          // Calculate planetary hours using the accurate implementation
          const hours = await calculatePlanetaryHours(
            latitude || 0, 
            longitude || 0, 
            new Date(), 
            timezone
          );

          const mappedHours = hours.map(mapHour);
          
          // Find the current hour
          const now = new Date();
          const currentHour = mappedHours.find(hour => 
            now >= hour.startTime && now < hour.endTime
          ) || null;
          
          set({ 
            hours: mappedHours,
            currentDayRuler: dayRuler,
            currentHour,
            lastUpdated: new Date().toISOString(),
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching planetary hours:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      },
      
      updateCurrentHour: () => {
        try {
          const { hours } = get();
          
          if (!hours || hours.length === 0) {
            // No hours available, fetch them first
            get().fetchPlanetaryHours();
            return;
          }
          
          const now = new Date();
          let currentHour = null;
          let needsRefresh = true;
          
          // Find the current hour
          for (const hour of hours) {
            if (now >= hour.startTime && now < hour.endTime) {
              // Mark this hour as current and ensure all other hours are not current
              currentHour = {
                hour: hour.hour,
                hourNumber: hour.hourNumber,
                planet: hour.planet,
                planetId: hour.planet,
                period: hour.isDay ? 'day' as const : 'night' as const,
                isDay: hour.isDay,
                startTime: hour.startTime,
                endTime: hour.endTime,
                isCurrentHour: true,
                isDayHour: hour.isDay
              };
              needsRefresh = false;
              break;
            }
          }
          
          // If we couldn't find a current hour, we might need to refresh the data
          if (needsRefresh) {
            // Check if we're past the last hour or before the first hour
            const firstHour = hours[0];
            const lastHour = hours[hours.length - 1];
            
            if (now < firstHour.startTime || now >= lastHour.endTime) {
              // We need to fetch new hours for the current day
              get().fetchPlanetaryHours();
              return;
            }
          }
          
          // Update the hours array to reflect the current hour
          const updatedHours = hours.map(hour => ({
            ...hour,
            isCurrentHour: currentHour && hour.hourNumber === currentHour.hourNumber ? true : false
          }));
          
          set({ 
            hours: updatedHours,
            currentHour,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error updating current hour:', error);
        }
      },
      
      fetchPlanetaryPositions: async (latitude, longitude) => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch planetary positions from the astrology service
          const positions = await getCurrentPlanetaryPositions({
            latitude,
            longitude,
          });
          
          // Map the positions to the format expected by the store
          const planetPositions: PlanetaryPosition[] = positions.map(pos => ({
            planet: pos.planet,
            sign: pos.sign,
            degree: pos.degree,
            isRetrograde: pos.isRetrograde
          }));
          
          set({
            planetPositions,
            lastUpdated: new Date().toISOString(),
            isLoading: false
          });
        } catch (error) {
          console.error('Error fetching planetary positions:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }),
    {
      name: 'planetary-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentDayRuler: state.currentDayRuler,
        lastUpdated: state.lastUpdated,
        planetPositions: state.planetPositions,
      }),
    }
  )
);