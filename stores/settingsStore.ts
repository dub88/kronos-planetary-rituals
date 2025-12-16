import { create } from 'zustand';
import { getUserSettings, updateUserSettings, getDefaultSettings as getDbDefaultSettings, supabase } from '../services/supabase';
import { storeEvents } from './events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReminderSettings, updateReminderSettings } from '../services/reminderService';
import { useAuthStore } from './authStore';

// Import Settings type from database.ts
import type { Settings as DatabaseSettings } from '../app/types/database';

// Extended settings type that includes reminder settings
interface Settings extends DatabaseSettings {
  calendar_reminders: boolean;
  push_notification_reminders: boolean;
}

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}



export const useSettingsStore = create<SettingsState>((set, get) => {
  // Create a local getDefaultSettings function that includes reminder settings
  const getDefaultSettings = (userId: string): Settings => ({
    ...getDbDefaultSettings(userId),
    calendar_reminders: false,
    push_notification_reminders: false
  });

  // Subscribe to auth events
  storeEvents.on('auth:initialized', () => get().fetchSettings());
  storeEvents.on('auth:login', () => get().fetchSettings());
  storeEvents.on('auth:logout', () => set({ settings: null }));

  return {
    settings: null,
    isLoading: false,
    error: null,
  
    fetchSettings: async () => {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        set({ settings: getDefaultSettings('default'), isLoading: false, error: null });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Silently use default settings when not authenticated
        set({ settings: getDefaultSettings('default'), isLoading: false, error: null });
        return;
      }
    
      set({ isLoading: true, error: null });
      try {
        // Get database settings
        const { data, error } = await getUserSettings(user.id);
        if (error) {
          // For new users or no settings found, use defaults
          // Check if it's a Postgres error with code PGRST116 (no rows returned)
          if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
            set({ settings: getDefaultSettings(user.id) });
            return;
          }
          throw error;
        }
        
        // Get reminder settings from AsyncStorage
        const reminderSettings = await getReminderSettings(user.id);
        
        // Combine database settings with reminder settings
        const combinedSettings = {
          ...(data || getDefaultSettings(user.id)),
          calendar_reminders: reminderSettings.calendar_reminders,
          push_notification_reminders: reminderSettings.push_notification_reminders
        };
        
        set({ settings: combinedSettings });
      } catch (error) {
        // Don't set error state for authentication issues
        if (error instanceof Error && error.message !== 'User not authenticated') {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch settings' });
        }
        console.error('Error fetching settings:', error);
        // Fall back to default settings
        set({ settings: getDefaultSettings('default') });
      } finally {
        set({ isLoading: false });
      }
    },
  
    initializeSettings: async () => {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        set({ settings: getDefaultSettings('default') });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ settings: getDefaultSettings('default') });
        return;
      }
      
      await get().fetchSettings();
    },
  
    updateSettings: async (newSettings) => {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      set({ isLoading: true, error: null });
      try {
        // Handle reminder settings separately using AsyncStorage
        const reminderSettings: any = {};
        
        // Extract reminder settings from newSettings
        if (newSettings.calendar_reminders !== undefined) {
          reminderSettings.calendar_reminders = newSettings.calendar_reminders;
          // Remove from database update to prevent errors
          delete newSettings.calendar_reminders;
        }
        
        if (newSettings.push_notification_reminders !== undefined) {
          reminderSettings.push_notification_reminders = newSettings.push_notification_reminders;
          // Remove from database update to prevent errors
          delete newSettings.push_notification_reminders;
        }
        
        // Update database settings (without reminder settings)
        const { data, error } = await updateUserSettings(user.id, newSettings);
        if (error) throw error;
        
        // Update reminder settings in AsyncStorage if needed
        if (Object.keys(reminderSettings).length > 0) {
          await updateReminderSettings(user.id, reminderSettings);
        }
        
        // Get current reminder settings
        const currentReminderSettings = await getReminderSettings(user.id);
        
        // Ensure all required fields are present in the data
        const completeSettings: Settings = {
          ...getDefaultSettings(user.id),
          ...data as Partial<Settings>,
          // Add reminder settings from AsyncStorage
          calendar_reminders: currentReminderSettings.calendar_reminders,
          push_notification_reminders: currentReminderSettings.push_notification_reminders
        };
        
        set({ settings: completeSettings });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update settings' });
        console.error('Error updating settings:', error);
      } finally {
        set({ isLoading: false });
      }
    },
  
    resetSettings: async () => {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        set({ settings: getDefaultSettings('default') });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ settings: getDefaultSettings('default') });
        return;
      }
      
      await get().updateSettings(getDefaultSettings(user.id));
    }
  };
});