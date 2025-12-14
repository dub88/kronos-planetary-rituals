import React from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Moon, Sun, Info, Shield, Trash2, LogOut, ChevronRight, Volume2, Vibrate, Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLocationStore } from '@/stores/locationStore';
import { useRitualStore } from '@/stores/ritualStore';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { scheduleUpcomingDayReminders } from '@/services/reminderService';
import { requestCalendarPermission } from '@/services/calendarService';
import { requestNotificationPermission } from '@/services/notificationService';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { location, fetchLocation, clearLocation } = useLocationStore();
  const { clearRituals } = useRitualStore();
  const { resetProfile } = useProfileStore();
  const { logout } = useAuthStore();
  
  const handleToggleNotifications = () => {
    try {
      if (settings) {
        updateSettings({ notifications: !settings.notifications });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };
  
  const handleToggleCalendarReminders = async () => {
    try {
      if (settings) {
        const newValue = !settings.calendar_reminders;
        updateSettings({ calendar_reminders: newValue });
        
        if (newValue) {
          // Request calendar permission when enabling calendar reminders
          const hasPermission = await requestCalendarPermission();
          
          if (hasPermission && settings.user_id) {
            // Schedule reminders for upcoming days
            await scheduleUpcomingDayReminders(settings.user_id);
          } else if (!hasPermission) {
            Alert.alert(
              'Calendar Permission Required',
              'Please grant calendar permission to add planetary days and hours to your calendar.',
              [{ text: 'OK' }]
            );
            // Revert the setting if permission was denied
            updateSettings({ calendar_reminders: false });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling calendar reminders:', error);
      Alert.alert('Error', 'Failed to toggle calendar reminders. Please try again.');
    }
  };
  
  const handleTogglePushNotificationReminders = async () => {
    try {
      if (settings) {
        const newValue = !settings.push_notification_reminders;
        updateSettings({ push_notification_reminders: newValue });
        
        if (newValue) {
          // Request notification permission when enabling push notification reminders
          const hasPermission = await requestNotificationPermission();
          
          if (hasPermission && settings.user_id) {
            // Schedule reminders for upcoming days
            await scheduleUpcomingDayReminders(settings.user_id);
          } else if (!hasPermission) {
            Alert.alert(
              'Notification Permission Required',
              'Please grant notification permission to receive push notifications for planetary days and hours.',
              [{ text: 'OK' }]
            );
            // Revert the setting if permission was denied
            updateSettings({ push_notification_reminders: false });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling push notification reminders:', error);
      Alert.alert('Error', 'Failed to toggle push notification reminders. Please try again.');
    }
  };
  
  const handleToggleDarkMode = () => {
    try {
      toggleTheme();
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };
  
  const handleToggleAutoLocation = async () => {
    try {
      if (settings) {
        const newValue = !settings.auto_detect_location;
        updateSettings({ auto_detect_location: newValue });
        
        if (newValue && Platform.OS !== 'web') {
          try {
            await fetchLocation();
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling auto location:', error);
    }
  };
  
  const handleToggleSound = () => {
    try {
      if (settings) {
        updateSettings({ sound_enabled: !settings.sound_enabled });
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };
  
  const handleToggleHaptic = () => {
    try {
      if (settings) {
        updateSettings({ haptic_feedback_enabled: !settings.haptic_feedback_enabled });
      }
    } catch (error) {
      console.error('Error toggling haptic feedback:', error);
    }
  };
  
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your rituals, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            try {
              clearRituals();
              resetProfile();
              resetSettings();
              clearLocation();
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'There was a problem resetting your data.');
            }
          }
        }
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            try {
              logout();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'There was a problem signing out.');
            }
          }
        }
      ]
    );
  };
  
  // Default values for settings if they're not loaded yet
  const defaultNotifications = true;
  const defaultAutoDetectLocation = true;
  const defaultSoundEnabled = true;
  const defaultHapticFeedbackEnabled = true;
  const defaultCalendarReminders = false;
  const defaultPushNotificationReminders = false;
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    control: React.ReactNode
  ) => {
    return (
      <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={[styles.settingIcon, { backgroundColor: `${colors.text}10` }]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text, fontFamily: 'System' }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary, fontFamily: 'System' }]}>{description}</Text>
        </View>
        {control}
      </View>
    );
  };
  
  const renderLinkItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity 
        style={[styles.linkItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} 
        onPress={onPress}
      >
        <View style={[styles.settingIcon, { backgroundColor: `${colors.text}10` }]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text, fontFamily: 'System' }]}>{title}</Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'System' }]}>App Settings</Text>
          
          {renderSettingItem(
            <Bell size={24} color={colors.text} />,
            'Notifications',
            'Receive alerts for planetary hours and daily rituals',
            <Switch
              value={settings?.notifications ?? defaultNotifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.notifications ?? defaultNotifications) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {Platform.OS !== 'web' && renderSettingItem(
            <Calendar size={24} color={colors.text} />,
            'Calendar Reminders',
            'Add planetary days and hours to your calendar',
            <Switch
              value={settings?.calendar_reminders ?? defaultCalendarReminders}
              onValueChange={handleToggleCalendarReminders}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.calendar_reminders ?? defaultCalendarReminders) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {Platform.OS !== 'web' && renderSettingItem(
            <Clock size={24} color={colors.text} />,
            'Push Notification Reminders',
            'Get push notifications for planetary days and hours',
            <Switch
              value={settings?.push_notification_reminders ?? defaultPushNotificationReminders}
              onValueChange={handleTogglePushNotificationReminders}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.push_notification_reminders ?? defaultPushNotificationReminders) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {Platform.OS !== 'web' && renderSettingItem(
            <MapPin size={24} color={colors.text} />,
            'Auto-detect Location',
            'Automatically determine your location for accurate planetary hours',
            <Switch
              value={settings?.auto_detect_location ?? defaultAutoDetectLocation}
              onValueChange={handleToggleAutoLocation}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.auto_detect_location ?? defaultAutoDetectLocation) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {renderSettingItem(
            isDark ? <Moon size={24} color={colors.text} /> : <Sun size={24} color={colors.text} />,
            isDark ? 'Dark Mode' : 'Light Mode',
            'Toggle between light and dark theme',
            <Switch
              value={isDark}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {renderSettingItem(
            <Volume2 size={24} color={colors.text} />,
            'Sound Effects',
            'Enable sound effects for rituals and interactions',
            <Switch
              value={settings?.sound_enabled ?? defaultSoundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.sound_enabled ?? defaultSoundEnabled) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
          
          {Platform.OS !== 'web' && renderSettingItem(
            <Vibrate size={24} color={colors.text} />,
            'Haptic Feedback',
            'Enable vibration for interactions and ritual completions',
            <Switch
              value={settings?.haptic_feedback_enabled ?? defaultHapticFeedbackEnabled}
              onValueChange={handleToggleHaptic}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={(settings?.haptic_feedback_enabled ?? defaultHapticFeedbackEnabled) ? '#f4f3f4' : '#f4f3f4'}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'System' }]}>About</Text>
          
          {renderLinkItem(
            <Info size={24} color={colors.text} />,
            'About Kronos',
            () => Alert.alert('About', 'Kronos is a planetary magic app that helps you align with cosmic energies through daily rituals and planetary hours.')
          )}
          
          {renderLinkItem(
            <Shield size={24} color={colors.text} />,
            'Privacy Policy',
            () => Alert.alert('Privacy Policy', 'Your privacy is important to us. We only collect location data with your permission to calculate accurate planetary hours.')
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'System' }]}>Account</Text>
          
          {renderLinkItem(
            <Trash2 size={24} color={colors.error} />,
            'Reset All Data',
            handleResetData
          )}
          
          {renderLinkItem(
            <LogOut size={24} color={colors.error} />,
            'Sign Out',
            handleLogout
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary, fontFamily: 'System' }]}>Kronos v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
  },
});