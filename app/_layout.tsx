import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../components/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { useColorScheme, View, Text } from 'react-native';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Auth routing helper
function useProtectedRoute(user: any, isGuest: boolean, isInitialized: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // First, ensure the navigation is ready
  useEffect(() => {
    // Set navigation ready in the next tick to ensure the navigation container is mounted
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Then handle the auth routing logic
  useEffect(() => {
    // Only proceed if both navigation is ready and initialization is complete
    if (!isNavigationReady || !isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (!user && !isGuest && !inAuthGroup) {
      // Redirect to the sign-in page if not signed in
      router.replace('/auth');
    } else if ((user || isGuest) && inAuthGroup) {
      // Redirect away from the sign-in page if signed in
      router.replace('/');
    }
  }, [user, isGuest, segments, router, isNavigationReady, isInitialized]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { settings, initializeSettings } = useSettingsStore();
  const { user, isGuest, initialize: initializeAuth } = useAuthStore();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep the splash screen visible while we initialize
  SplashScreen.preventAutoHideAsync();

  // Use the protected route hook with initialization status
  useProtectedRoute(user, isGuest, isInitialized);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue even if fonts fail to load
        setFontsLoaded(true);
      }
    }
    
    loadFonts();
  }, []);

  // Initialize settings and auth on app load
  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          initializeSettings(),
          initializeAuth()
        ]);
        // Mark initialization as complete
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Even on error, consider initialization complete
        setIsInitialized(true);
      } finally {
        // Only hide splash screen when both initialization and fonts are loaded
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    };
    
    initialize();
  }, [initializeSettings, initializeAuth, fontsLoaded]);

  // Determine if dark mode should be used
  const isDarkMode = settings?.theme === 'system' 
    ? colorScheme === 'dark' 
    : settings?.theme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="hymn/[id]" options={{ headerShown: true, title: 'Hymn' }} />
            <Stack.Screen name="ritual/[id]" options={{ headerShown: true, title: 'Ritual' }} />
          </Stack>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}