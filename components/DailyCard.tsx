import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, Text, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';

interface DailyCardProps {
  children?: ReactNode;
  style?: ViewStyle;
  color?: string;
  glowing?: boolean;
  variant?: 'default' | 'parchment' | 'iron' | 'ritual';
  title?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const DailyCard = ({ 
  children, 
  style, 
  color,
  glowing = false,
  variant = 'default',
  title,
  onPress,
  accessibilityLabel
}: DailyCardProps) => {
  const { colors, currentDayTheme } = useTheme();
  
  // Use provided color or default from theme
  const cardColor = color || colors.surface2 || colors.surface;
  
  // Determine gradient colors based on variant and day theme
  const getGradientColors = () => {
    try {
      switch (variant) {
        case 'parchment':
          return [colors.surface2 || colors.surface, colors.surface, colors.surface] as readonly [string, string, string];
        case 'iron':
          return [colors.surface2 || colors.surface, colors.surface, colors.surface] as readonly [string, string, string];
        case 'ritual':
          return [cardColor, colors.surface, colors.surface] as readonly [string, string, string];
        default:
          // For default case, ensure we have at least 2 colors as required by LinearGradient
          return [cardColor, colors.surface, colors.surface] as readonly [string, string, string];
      }
    } catch (error) {
      console.error('Error in getGradientColors:', error);
      return [colors.surface, colors.surface, colors.surface] as readonly [string, string, string];
    }
  };
  
  // Get border style based on the day's theme
  const getBorderStyle = () => {
    try {
      if (!currentDayTheme || !currentDayTheme.patterns) {
        return { borderColor: `${colors.text}10`, borderWidth: 1 };
      }
      
      const borderStyle = currentDayTheme.patterns.background || '';
      
      if (borderStyle.includes('radial')) return { borderColor: '#D4AF37', borderWidth: 1.5 }; // Sun - golden
      if (borderStyle.includes('waves')) return { borderColor: '#C0C0C0', borderWidth: 1.5 }; // Moon - silver
      if (borderStyle.includes('forge')) return { borderColor: '#43464B', borderWidth: 2 }; // Mars - iron
      if (borderStyle.includes('circuit')) return { borderColor: '#A9A9A9', borderWidth: 1 }; // Mercury - alloy
      if (borderStyle.includes('stars')) return { borderColor: '#8A9597', borderWidth: 1.5 }; // Jupiter - tin
      if (borderStyle.includes('petals')) return { borderColor: '#B87333', borderWidth: 1.5 }; // Venus - copper
      if (borderStyle.includes('stone')) return { borderColor: '#2F4F4F', borderWidth: 2 }; // Saturn - lead
      
      return { borderColor: `${colors.text}10`, borderWidth: 1 };
    } catch (error) {
      console.error('Error in getBorderStyle:', error);
      return { borderColor: `${colors.text}10`, borderWidth: 1 };
    }
  };
  
  const borderStyle = getBorderStyle();
  const borderRadius = currentDayTheme?.ui?.cardBorderRadius || 8;
  
  // Get pattern based on the day's theme
  const getPatternElement = () => {
    try {
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
    } catch (error) {
      console.error('Error in getPatternElement:', error);
      return null;
    }
  };
  
  // Safely get primary color with fallback
  const primaryColor = currentDayTheme?.colors?.primary || colors.primary;
  
  // Determine if we should use TouchableOpacity or View based on onPress prop
  const CardComponent = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? {
    onPress,
    activeOpacity: 0.9,
    accessibilityRole: "button" as const,
    accessibilityLabel: accessibilityLabel || title,
  } : {};
  
  // Add web-specific styles for better mobile experience
  const webStyles: ViewStyle = Platform.OS === 'web' ? {
    // @ts-ignore - these are web-specific properties
    WebkitTapHighlightColor: 'transparent',
    cursor: onPress ? 'pointer' : 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
    // Add hover effect only for interactive cards
    ...(onPress && {
      // @ts-ignore - web-specific
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    })
  } : {};
  
  return (
    <CardComponent style={[
      styles.container, 
      { borderRadius },
      style,
      webStyles
    ]} {...cardProps}>
      {/* Jagged border effect */}
      <View style={[styles.jaggedBorder, borderStyle]}>
        {/* Glowing effect for active cards */}
        {glowing && (
          <LinearGradient
            colors={[cardColor, 'transparent'] as readonly [string, string]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.glow}
          />
        )}
        
        {/* Title if provided */}
        {title && (
          <View style={[
            styles.titleContainer, 
            { 
              backgroundColor: primaryColor,
              borderBottomColor: borderStyle.borderColor,
              borderBottomWidth: borderStyle.borderWidth,
            }
          ]}>
            <Text style={[
              styles.titleText, 
              { 
                color: colors.text,
                fontFamily: currentDayTheme?.typography?.titleFont || 'System',
              }
            ]}>{title}</Text>
          </View>
        )}
        
        {/* Day-specific pattern */}
        {getPatternElement()}
        
        {/* Card content */}
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.content,
            { borderRadius }
          ]}
        >
          {children}
        </LinearGradient>
      </View>
      
      {/* Decorative elements */}
      <View style={[styles.cornerTL, { borderColor: `${colors.text}15` }]} />
      <View style={[styles.cornerTR, { borderColor: `${colors.text}15` }]} />
      <View style={[styles.cornerBL, { borderColor: `${colors.text}15` }]} />
      <View style={[styles.cornerBR, { borderColor: `${colors.text}15` }]} />
      
      {/* Ink drips */}
      <View style={[styles.inkDrip, { backgroundColor: `${colors.text}10`, left: '20%', height: 6 }]} />
      <View style={[styles.inkDrip, { backgroundColor: `${colors.text}10`, left: '70%', height: 8 }]} />
      <View style={[styles.inkDrip, { backgroundColor: `${colors.text}10`, left: '40%',  height: 4 }]} />
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    position: 'relative',
    // Add better touch target size for mobile
    minHeight: 80,
  },
  jaggedBorder: {
    overflow: 'hidden',
    position: 'relative',
  },
  titleContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    overflow: 'hidden',
    padding: 16,
  },
  defaultContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

export default DailyCard;