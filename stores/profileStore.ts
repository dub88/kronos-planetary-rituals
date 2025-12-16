import { create } from 'zustand';
import { getUserProfile, updateUserProfile, supabase } from '../services/supabase';
import { storeEvents } from './events';
import { useAuthStore } from './authStore';

// Import Profile type from database.ts
import type { Profile } from '../app/types/database';


interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  addExperience: (amount: number) => Promise<void>;
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  resetProfile: () => Promise<void>;
  clearError: () => void;
}

// Include id field which is required by the Profile type
const defaultProfile: Profile = {
  id: '', // This will be filled with the user's ID when authenticated
  name: 'Seeker',
  bio: 'A seeker of cosmic wisdom',
  avatar_url: null,
  level: 1,
  experience: 0,
  streak_days: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const useProfileStore = create<ProfileState>((set, get) => {
  // Subscribe to auth events
  storeEvents.on('auth:initialized', () => get().fetchProfile());
  storeEvents.on('auth:login', () => get().fetchProfile());
  storeEvents.on('auth:logout', () => set({ profile: null }));

  return {
    profile: defaultProfile,
    isLoading: false,
    error: null,
      
    fetchProfile: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Silently use default profile when not authenticated
        set({ profile: defaultProfile, isLoading: false, error: null });
        return;
      }
      
      // Create a profile with the user's ID
      const profileWithId = { ...defaultProfile, id: user.id };
      
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await getUserProfile(user.id);
        if (error) {
          // Handle the specific case of no rows returned (new user)
          // Check if it's a Postgres error with code PGRST116 (no rows returned)
          if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
            // Use default profile for new users with the correct ID
            set({ profile: profileWithId });
            return;
          }
          throw error;
        }
        
        set({ profile: data });
      } catch (error: any) {
        console.error('Error in fetchProfile:', error);
        // Don't set error state for authentication issues
        if (error.message !== 'User not authenticated') {
          set({ error: error.message || 'Failed to fetch profile' });
        }
        // Fall back to default profile with the user's ID
        set({ profile: profileWithId });
      } finally {
        set({ isLoading: false });
      }
    },
      
    updateProfile: async (updates) => {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await updateUserProfile(user.id, {
          ...updates,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        
        set({ profile: data });
      } catch (error: any) {
        console.error('Error in updateProfile:', error);
        set({ error: error.message || 'Failed to update profile' });
      } finally {
        set({ isLoading: false });
      }
    },
      
    addExperience: async (amount) => {
      const { profile } = get();
      if (!profile) return;
      
      const newExperience = profile.experience + amount;
      const experiencePerLevel = 100;
      const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
      
      await get().updateProfile({
        experience: newExperience,
        level: newLevel
      });
    },
      
    incrementStreak: async () => {
      const { profile } = get();
      if (!profile) return;
      
      await get().updateProfile({
        streak_days: profile.streak_days + 1
      });
    },
      
    resetStreak: async () => {
      await get().updateProfile({
        streak_days: 0
      });
    },
      
    resetProfile: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Create a profile with the user's ID but reset all other values
      const resetProfileData = { 
        ...defaultProfile, 
        id: user.id,
        updated_at: new Date().toISOString() 
      };
      
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await updateUserProfile(user.id, resetProfileData);
        if (error) throw error;
        
        set({ profile: data });
      } catch (error: any) {
        console.error('Error in resetProfile:', error);
        set({ error: error.message || 'Failed to reset profile' });
      } finally {
        set({ isLoading: false });
      }
    },
      
    clearError: () => {
      set({ error: null });
    }
  };
});