import { create } from 'zustand';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RitualDefinition } from '@/types';
import { RitualLog } from '@/app/types/database';
import { getRitualLogs, addRitualLog } from '@/services/supabase';
import { useAuthStore } from './authStore';
import { ritualData } from '@/constants/rituals';
import uuid from '@/utils/uuid';

// This interface is deprecated, use RitualLog from database.ts instead
interface CompletedRitual extends RitualLog {}

const mockCompletedRituals: RitualLog[] = [];

interface RitualState {
  rituals: RitualDefinition[];
  completedRituals: RitualLog[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRituals: () => Promise<void>;
  fetchCompletedRituals: () => Promise<void>;
  completeRitual: (ritualData: { id: string, planetId: string, completedAt: string, notes?: string, rating?: number }) => Promise<void>;
  getRitualById: (id: string) => RitualDefinition | undefined;
  clearRituals: () => void;
}



export const useRitualStore = create<RitualState>()((set, get) => ({
  rituals: [],
  completedRituals: [],
  loading: false,
  error: null,
      
  fetchRituals: async () => {
    try {
      set({ loading: true, error: null });
      // Use rituals from constants
      set({ rituals: ritualData, loading: false });
    } catch (error: any) {
      console.error('Error fetching rituals:', error);
      set({ error: 'Failed to fetch rituals', loading: false });
    }
  },
      
      fetchCompletedRituals: async () => {
        try {
          set({ loading: true, error: null });
          
          const user = useAuthStore.getState().user;
          if (!user) {
            // If no user is logged in, use mock data
            set({ completedRituals: mockCompletedRituals, loading: false });
            return;
          }
          
          // If user is logged in, try to get ritual logs from Supabase
          const { data, error } = await getRitualLogs(user.id);
          
          if (error) {
            console.error('Error fetching ritual logs:', error);
            throw error;
          }
          
          // Use ritual logs directly
          const completedRituals: RitualLog[] = data;
          
          set({ completedRituals, loading: false });
        } catch (error: any) {
          console.error('Error fetching completed rituals:', error);
          
          // Fallback to mock data on error
          set({ 
            completedRituals: mockCompletedRituals, 
            error: 'Failed to fetch completed rituals, using mock data', 
            loading: false 
          });
        }
      },
      
      completeRitual: async (ritualData) => {
        try {
          set({ loading: true, error: null });
          
          const user = useAuthStore.getState().user;
          const userId = user?.id || 'anonymous';
          
          // Create a ritual log to save to Supabase
          const ritualLog = {
            id: ritualData.id,
            user_id: userId,
            ritual_id: ritualData.planetId,
            completed_at: ritualData.completedAt,
            notes: ritualData.notes || '',
            rating: 5, // Default rating
            created_at: new Date().toISOString()
          };
          
          // Try to add the ritual log to Supabase
          await addRitualLog(ritualLog);
          
          // Create a ritual log for local state
          const completedRitual: RitualLog = {
            id: ritualData.id,
            user_id: userId,
            ritual_id: ritualData.planetId,
            completed_at: ritualData.completedAt,
            notes: ritualData.notes || '',
            rating: 5, // Default rating
            created_at: new Date().toISOString()
          };
          
          set(state => ({
            completedRituals: [...state.completedRituals, completedRitual],
            loading: false
          }));
          
          return Promise.resolve();
        } catch (error: any) {
          console.error('Error completing ritual:', error);
          set({ error: 'Failed to complete ritual', loading: false });
          return Promise.reject(error);
        }
      },
      
      getRitualById: (id: string) => {
        return get().rituals.find(ritual => ritual.id === id);
      },
      
      clearRituals: () => {
        set({ completedRituals: [], error: null });
      }
    })
);