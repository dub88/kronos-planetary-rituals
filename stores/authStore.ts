import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { storeEvents } from './events';

interface AuthState {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  login: (email: string, password: string | null, isBiometric?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isGuest: false,
      isLoading: false,
      error: null,
      
      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          
          if (session) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            set({ user, session, isGuest: false });
            
            // Notify other stores that auth is initialized
            storeEvents.emit('auth:initialized');
          } else {
            set({ user: null, session: null });
          }
        } catch (error: any) {
          console.error('Error initializing auth:', error);
          set({ error: error.message || 'Failed to initialize auth', user: null, session: null });
        } finally {
          set({ isLoading: false });
        }
      },
      
      login: async (email: string, password: string | null, isBiometric: boolean = false) => {
        set({ isLoading: true, error: null });
        try {
          let data;
          
          if (isBiometric) {
            // For biometric login, we use the stored session
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            // Refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;
            
            data = refreshData;
          } else {
            // Regular email/password login
            const { data: authData, error } = await supabase.auth.signInWithPassword({
              email,
              password: password!
            });
            
            if (error) throw error;
            data = authData;
          }

          if (!data?.user || !data?.session) throw new Error('No user data returned');
          
          set({ 
            user: data.user,
            session: data.session,
            isGuest: false,
          });
          
          // Notify other stores that user has logged in
          storeEvents.emit('auth:login');
        } catch (error: any) {
          console.error('Login error:', error);
          set({ error: error.message || 'Login failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name
              }
            }
          });
          
          if (error) throw error;
          if (!data?.user) throw new Error('No user data returned');
          
          // Note: At this point, the user needs to verify their email
          // The profile and settings will be auto-created by our database trigger
          set({
            user: data.user,
            session: data.session, // This might be null until email is verified
            isGuest: false,
          });
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ error: error.message || 'Registration failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ user: null, session: null, isGuest: false });
          // Notify other stores that user has logged out
          storeEvents.emit('auth:logout');
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ error: error.message || 'Logout failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      enterGuestMode: () => {
        set({ user: null, session: null, isGuest: true, error: null });
        storeEvents.emit('auth:login');
      },

      exitGuestMode: () => {
        set({ isGuest: false });
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          });
          
          if (error) throw error;
          
          // Note: data.user and data.session will be null here
          // because this is a redirect-based flow. The session
          // will be handled in the callback screen.
          
          // Don't return data, just return void to match the Promise<void> return type
          return;
        } catch (error: any) {
          console.error('Google login error:', error);
          set({ error: error.message || 'Google login failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isGuest: state.isGuest,
      }),
    }
  )
);