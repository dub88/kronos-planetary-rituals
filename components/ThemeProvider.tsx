import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { dayThemes } from '../constants/dayThemes';
import { getPlanetaryDayRuler } from '../utils/planetaryHours';
import { useSettingsStore } from '../stores/settingsStore';
import type { PlanetDay } from '../types';
import type { DayTheme } from '../app/types/index';

// Type assertion function to ensure planetId is a valid PlanetDay
const asPlanetDay = (id: string): PlanetDay => {
  const validPlanetIds = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  if (validPlanetIds.includes(id)) {
    return id as PlanetDay;
  }
  return 'sun'; // Default fallback
};

// Define theme colors with modern aesthetics
const lightColors = {
  primary: '#5B5FF6',
  secondary: '#00D4B8',
  onPrimary: '#FFFFFF',
  onSecondary: '#06201B',
  background: '#F7F7FF',
  surface: '#FFFFFF',
  surface2: '#F1F2FF',
  card: '#FFFFFF',
  text: '#0B1020',
  textSecondary: '#3E465E',
  textTertiary: '#7680A0',
  border: 'rgba(20, 28, 51, 0.10)',
  notification: '#FF3D7F',
  error: '#EF4444',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#2563EB',
  shadow: 'rgba(10, 16, 32, 0.12)',
  shadowStrong: 'rgba(10, 16, 32, 0.20)',
  inkStain: '#1C2340',
  runeEtch: '#394165',
  
  // Planet colors - slightly adjusted for modern palette
  sun: '#FF9D2E',           // Vibrant orange
  moon: '#A4ABDF',          // Soft lavender
  mercury: '#7986CB',       // Periwinkle
  venus: '#F45D90',         // Rose pink
  mars: '#F45D5D',          // Bright red
  jupiter: '#7E57C2',       // Purple
  saturn: '#5D5A53',        // Warm gray
  uranus: '#26C6DA',        // Teal
  neptune: '#42A5F5',       // Blue
  pluto: '#8D6E63',         // Earth brown
};

const darkColors = {
  primary: '#A8A5FF',
  secondary: '#28E0D0',
  onPrimary: '#0A0B14',
  onSecondary: '#071211',
  background: '#070712',
  surface: '#0E1020',
  surface2: '#14162B',
  card: '#0F1124',
  text: '#F3F4FF',
  textSecondary: '#B9BDE0',
  textTertiary: '#7B80A8',
  border: 'rgba(255, 255, 255, 0.10)',
  notification: '#FF4D8D',
  error: '#FF5C5C',
  success: '#4ADE80',
  warning: '#FDBA74',
  info: '#60A5FA',
  shadow: 'rgba(0,0,0,0.45)',
  shadowStrong: 'rgba(0,0,0,0.70)',
  inkStain: '#D6D8FF',
  runeEtch: '#AEB3DD',
  
  // Planet colors
  sun: '#FFB74D',
  moon: '#B0BEC5',
  mercury: '#90CAF9',
  venus: '#F48FB1',
  mars: '#EF9A9A',
  jupiter: '#B39DDB',
  saturn: '#8D6E63',
  uranus: '#4DD0E1',
  neptune: '#64B5F6',
  pluto: '#A1887F',
};

// Create theme context
interface ThemeContextType {
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
  currentDayTheme: DayTheme;
}

// Initialize with default values
const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  currentDayTheme: dayThemes.sun,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const { settings } = useSettingsStore();
  
  // Use system preference as initial value, but respect user settings if available
  const [isDark, setIsDark] = useState(() => {
    if (settings && settings.dark_mode !== undefined) {
      return settings.dark_mode;
    }
    return colorScheme === 'dark';
  });
  
  // Get current day's planetary ruler with error handling
  const [currentDayTheme, setCurrentDayTheme] = useState<DayTheme>(() => {
    try {
      const planetId = asPlanetDay(getPlanetaryDayRuler());
      
      // Ensure dayThemes is defined
      if (!dayThemes) {
        console.error('dayThemes is undefined');
        // Create a default theme instead of trying to access dayThemes.sun
        return {
          name: 'Solar',
          description: 'Radiant energy of vitality and leadership',
          gradient: ['#FF9500', '#FF5E3A'],
          color: '#FF7A00',
          ui: {
            cardBorderRadius: 16,
            buttonBorderRadius: 8,
          },
          symbol: '☉',
          planetId: asPlanetDay('sun'),
          correspondences: {
            colors: ['Gold', 'Yellow', 'Orange'],
            herbs: ['Sunflower', 'Marigold', 'St. John\'s Wort'],
            incense: ['Frankincense', 'Cinnamon', 'Orange'],
            crystals: ['Citrine', 'Amber', 'Tiger\'s Eye'],
            metal: 'Gold'
          },
          motifs: {
            element: 'Fire',
            pattern: 'Radial',
            symbol: '☉',
            borderStyle: 'golden',
            accentElement: 'sunflower'
          },
          patterns: {
            background: 'radial'
          },
          colors: {
            primary: '#FF9500',
            secondary: '#FF5E3A',
            gradientStart: '#FFF9F0',
            gradientMiddle: '#FFF5E6',
            gradientEnd: '#FFF0D9'
          },
          typography: {
            titleFont: 'Inter-Bold',
            bodyFont: 'Inter-Regular'
          }
        };
      }
      
      // Access dayThemes by key directly, not using find()
      if (planetId && dayThemes[planetId]) {
        return dayThemes[planetId];
      } else {
        console.warn(`No theme found for planetId: ${planetId}, using sun as fallback`);
        // Return the sun theme if it exists, otherwise return the first theme in dayThemes
        // Return a valid theme with proper typing
        return dayThemes.sun || Object.values(dayThemes)[0];
      }
    } catch (error) {
      console.error('Error getting day theme:', error);
      // Return the sun theme if it exists, otherwise return the first theme in dayThemes
      return dayThemes.sun || Object.values(dayThemes)[0] || {
        name: 'Solar',
        description: 'Radiant energy of vitality and leadership',
        gradient: ['#FF9500', '#FF5E3A'],
        color: '#FF7A00',
        ui: {
          cardBorderRadius: 16,
          buttonBorderRadius: 8,
        },
        symbol: '☉',
        planetId: 'sun' as PlanetDay,
        correspondences: {
          colors: ['Gold', 'Yellow', 'Orange'],
          herbs: ['Sunflower', 'Marigold', 'St. John\'s Wort'],
          incense: ['Frankincense', 'Cinnamon', 'Orange'],
          crystals: ['Citrine', 'Amber', 'Tiger\'s Eye'],
          metal: 'Gold'
        },
        motifs: {
          element: 'Fire',
          pattern: 'Radial',
          symbol: '☉',
          borderStyle: 'golden',
          accentElement: 'sunflower'
        },
        patterns: {
          background: 'radial'
        },
        colors: {
          primary: '#FF9500',
          secondary: '#FF5E3A',
          gradientStart: '#FFF9F0',
          gradientMiddle: '#FFF5E6',
          gradientEnd: '#FFF0D9'
        },
        typography: {
          titleFont: 'Inter-Bold',
          bodyFont: 'Inter-Regular'
        }
      };
    }
  });
  
  // Update theme when settings change
  useEffect(() => {
    if (settings && settings.dark_mode !== undefined) {
      setIsDark(settings.dark_mode);
    }
  }, [settings]);
  
  // Update day theme based on current day
  useEffect(() => {
    try {
      const planetId = getPlanetaryDayRuler() as PlanetDay;
      
      // Ensure dayThemes is defined and has the planetId as a key
      if (!dayThemes) {
        console.error('dayThemes is undefined');
        return; // Don't update if dayThemes is undefined
      }
      
      if (planetId) {
        // Access dayThemes by key directly, not using find()
        const theme = dayThemes[planetId];
        if (theme) {
          // Ensure the theme's planetId is properly typed
          const typedTheme = {
            ...theme,
            planetId: asPlanetDay(theme.planetId)
          };
          setCurrentDayTheme(typedTheme);
        } else {
          console.warn(`No theme found for planetId: ${planetId}, keeping current theme`);
        }
      }
    } catch (error) {
      console.error('Error setting day theme:', error);
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (useSettingsStore.getState().updateSettings) {
      useSettingsStore.getState().updateSettings({ dark_mode: !isDark });
    }
  };
  
  const colors = isDark ? { ...darkColors } : { ...lightColors };
  
  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, currentDayTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;