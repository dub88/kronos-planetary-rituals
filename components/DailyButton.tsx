import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const DailyButton = ({ title, onPress, icon, disabled = false }: DailyButtonProps) => {
  const { currentDayTheme, colors, isDark } = useTheme();
  
  // Safely get gradient colors with fallback
  const gradientColors = (() => {
    const g = currentDayTheme?.gradient;
    if (g && g.length >= 2) {
      return [g[0], g[1], ...g.slice(2)] as [string, string, ...string[]];
    }
    return ['#FFFFFF', '#EEEEEE'] as [string, string];
  })();
  
  // Safely get border radius with fallback
  const borderRadius = currentDayTheme?.ui?.buttonBorderRadius || 12;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderRadius },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.gradient, { borderRadius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default DailyButton;