import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';

export interface GothicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  glowing?: boolean;
  variant?: 'default' | 'parchment' | 'iron' | 'ritual';
  withGradient?: boolean;
}

const GothicCard = ({ 
  children, 
  style, 
  color,
  glowing = false,
  variant = 'default',
  withGradient = false
}: GothicCardProps) => {
  const { colors, currentDayTheme } = useTheme();
  
  // Use provided color or default from theme
  const cardColor = color || colors.surface2 || colors.surface;
  
  // Determine gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'parchment':
        return [colors.surface2 || colors.surface, colors.surface, colors.surface];
      case 'iron':
        return [colors.surface2 || colors.surface, colors.surface, colors.surface];
      case 'ritual':
        return [cardColor, colors.surface, colors.surface];
      default:
        return [cardColor, colors.surface];
    }
  };
  
  // Get border style based on the day's theme - now returning no border
  const getBorderStyle = () => {
    return { borderWidth: 0 };
  };
  
  const borderStyle = getBorderStyle();
  
  // Get pattern based on the day's theme
  const getPatternElement = () => {
    if (!currentDayTheme || !currentDayTheme.patterns) {
      return null;
    }
    
    const pattern = currentDayTheme.patterns.background || '';
    
    if (pattern.includes('radial')) {
      return (
        <View style={styles.sunburstPattern}>
          <Text style={styles.patternText}>☀</Text>
        </View>
      );
    }
    
    if (pattern.includes('waves')) {
      return (
        <View style={styles.moonlitPattern}>
          <Text style={styles.patternText}>☽</Text>
        </View>
      );
    }
    
    if (pattern.includes('forge')) {
      return (
        <View style={styles.volcanicPattern}>
          <Text style={styles.patternText}>≈</Text>
        </View>
      );
    }
    
    if (pattern.includes('circuit')) {
      return (
        <View style={styles.mercurialPattern}>
          <Text style={styles.patternText}>≋</Text>
        </View>
      );
    }
    
    if (pattern.includes('stars')) {
      return (
        <View style={styles.celestialPattern}>
          <Text style={styles.patternText}>✧</Text>
        </View>
      );
    }
    
    if (pattern.includes('petals')) {
      return (
        <View style={styles.rosePattern}>
          <Text style={styles.patternText}>✿</Text>
        </View>
      );
    }
    
    if (pattern.includes('stone')) {
      return (
        <View style={styles.crackedPattern}>
          <Text style={styles.patternText}>⋱</Text>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Card content - simplified with no gradients or decorative elements */}
      <View style={[styles.jaggedBorder, borderStyle]}>
        <View style={[styles.content, { backgroundColor: cardColor }]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 2, // Sharp corners
    position: 'relative',
  },
  jaggedBorder: {
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  content: {
    borderRadius: 2,
    overflow: 'hidden',
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
  // Ink drip effect
  inkDrip: {
    position: 'absolute',
    bottom: -2,
    width: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  // Day-specific patterns
  sunburstPattern: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    opacity: 0.03,
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  moonlitPattern: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    opacity: 0.03,
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  volcanicPattern: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.05,
    zIndex: 1,
  },
  mercurialPattern: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.05,
    zIndex: 1,
  },
  celestialPattern: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    opacity: 0.05,
    zIndex: 1,
  },
  rosePattern: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    opacity: 0.05,
    zIndex: 1,
  },
  crackedPattern: {
    position: 'absolute',
    bottom: '40%',
    right: '30%',
    opacity: 0.05,
    zIndex: 1,
  },
  patternText: {
    fontSize: 50,
    color: '#FFFFFF',
  },
});

export default GothicCard;