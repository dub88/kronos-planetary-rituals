import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import BackgroundPattern from './BackgroundPattern';

interface DailyThemeContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  patternOpacity?: number;
  patternScale?: number;
  withGradient?: boolean;
}

const DailyThemeContainer = ({ 
  children, 
  style, 
  patternOpacity = 0.05,
  patternScale = 1,
  withGradient = true
}: DailyThemeContainerProps) => {
  const { currentDayTheme, colors } = useTheme();
  
  // Get border style based on the day's theme
  const getBorderStyle = () => {
    if (!currentDayTheme || !currentDayTheme.patterns || !currentDayTheme.patterns.background) {
      return { borderColor: `${colors.text}10`, borderWidth: 1 };
    }
    
    const borderStyle = currentDayTheme.patterns.background;
    
    if (borderStyle.includes('radial')) return { borderColor: '#D4AF37', borderWidth: 1.5 }; // Sun - golden
    if (borderStyle.includes('waves')) return { borderColor: '#C0C0C0', borderWidth: 1.5 }; // Moon - silver
    if (borderStyle.includes('forge')) return { borderColor: '#43464B', borderWidth: 2 }; // Mars - iron
    if (borderStyle.includes('circuit')) return { borderColor: '#A9A9A9', borderWidth: 1 }; // Mercury - alloy
    if (borderStyle.includes('stars')) return { borderColor: '#8A9597', borderWidth: 1.5 }; // Jupiter - tin
    if (borderStyle.includes('petals')) return { borderColor: '#B87333', borderWidth: 1.5 }; // Venus - copper
    if (borderStyle.includes('stone')) return { borderColor: '#2F4F4F', borderWidth: 2 }; // Saturn - lead
    
    return { borderColor: `${colors.text}10`, borderWidth: 1 };
  };
  
  const borderStyle = getBorderStyle();
  const borderRadius = currentDayTheme?.ui?.cardBorderRadius || 8;
  
  // Safely access gradient colors with fallbacks
  const gradientStart = currentDayTheme?.colors?.gradientStart || colors.background;
  const gradientMiddle = currentDayTheme?.colors?.gradientMiddle || colors.background;
  const gradientEnd = currentDayTheme?.colors?.gradientEnd || colors.background;
  
  const gradientColors = [gradientStart, gradientMiddle, gradientEnd] as [string, string, string];
  
  return (
    <View style={[
      styles.container, 
      { 
        borderRadius,
        ...borderStyle
      },
      style
    ]}>
      {withGradient ? (
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
        >
          <BackgroundPattern opacity={patternOpacity} scale={patternScale} />
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <BackgroundPattern opacity={patternOpacity} scale={patternScale} />
          {children}
        </View>
      )}
      
      {/* Decorative corners based on the day's theme */}
      <View style={[styles.cornerTL, borderStyle]} />
      <View style={[styles.cornerTR, borderStyle]} />
      <View style={[styles.cornerBL, borderStyle]} />
      <View style={[styles.cornerBR, borderStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  // Decorative corner elements
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});

export default DailyThemeContainer;