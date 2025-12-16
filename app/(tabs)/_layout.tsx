import React from "react";
import { Tabs } from "expo-router";
import { Home, Calendar, BookOpen, User, Settings } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useSettingsStore } from "../../stores/settingsStore";
import { useAuthStore } from "../../stores/authStore";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const { settings } = useSettingsStore();
  const { isGuest } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // Determine if dark mode should be used
  const isDarkMode = settings?.theme === 'system' 
    ? colorScheme === 'dark' 
    : settings?.theme === 'dark';
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14 + insets.bottom,
          height: 78,
          paddingBottom: 14,
          paddingTop: 10,
          borderRadius: 18,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          shadowColor: colors.shadowStrong || colors.shadow,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginBottom: 0,
          lineHeight: 14,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: 'transparent',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: 0.2,
          fontFamily: 'Inter-Bold',
        },
        headerTintColor: colors.text,
        headerShown: true,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          headerTitle: "Today",
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          headerTitle: "Calendar",
          tabBarIcon: ({ color }) => (
            <Calendar size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          headerTitle: "Learn",
          tabBarIcon: ({ color }) => (
            <BookOpen size={24} color={color} />
          ),
        }}
      />
      {!isGuest ? (
        <>
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              headerTitle: "Profile",
              tabBarIcon: ({ color }) => (
                <User size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              headerTitle: "Settings",
              tabBarIcon: ({ color }) => (
                <Settings size={24} color={color} />
              ),
            }}
          />
        </>
      ) : null}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});