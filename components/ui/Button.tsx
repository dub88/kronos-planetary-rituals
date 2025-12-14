import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  View,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../components/ThemeProvider';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) => {
  const { colors, currentDayTheme } = useTheme();
  
  // Get button styles based on variant, size, and day theme
  const getButtonStyles = () => {
    // Base styles
    const baseStyles: ViewStyle = {
      opacity: disabled ? 0.6 : 1,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };
    
    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      small: { 
        paddingVertical: 8, 
        paddingHorizontal: 16,
        minHeight: 36,
      },
      medium: { 
        paddingVertical: 12, 
        paddingHorizontal: 20,
        minHeight: 44,
      },
      large: { 
        paddingVertical: 16, 
        paddingHorizontal: 24,
        minHeight: 52,
      },
    };
    
    // Border radius based on day theme or default to modern rounded style
    const borderRadius = currentDayTheme?.ui?.buttonBorderRadius || 12;
    
    // Variant styles
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          ...sizeStyles[size],
          borderRadius,
          backgroundColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.18,
          shadowRadius: 18,
          elevation: 3,
        };
      case 'secondary':
        return {
          ...baseStyles,
          ...sizeStyles[size],
          borderRadius,
          backgroundColor: colors.secondary,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: Platform.OS === 'web' ? 0.10 : 0.16,
          shadowRadius: 14,
          elevation: 2,
        };
      case 'outline':
        return {
          ...baseStyles,
          ...sizeStyles[size],
          borderRadius,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.surface,
        };
      case 'ghost':
        return {
          ...baseStyles,
          ...sizeStyles[size],
          borderRadius,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...baseStyles,
          ...sizeStyles[size],
          borderRadius,
          backgroundColor: colors.primary,
        };
    }
  };
  
  // Get text styles based on variant and size
  const getTextStyles = () => {
    // Base text styles
    const baseTextStyles: TextStyle = {
      fontFamily: currentDayTheme?.typography?.bodyFont || 'Inter-Medium',
      textAlign: 'center',
    };
    
    // Size variations
    const sizeTextStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16, letterSpacing: 0.2 },
      large: { fontSize: 18, fontWeight: '600', letterSpacing: 0.3 },
    };
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyles,
          ...sizeTextStyles[size],
          color: colors.onPrimary,
        };
      case 'secondary':
        return {
          ...baseTextStyles,
          ...sizeTextStyles[size],
          color: colors.onSecondary,
        };
      case 'outline':
        return {
          ...baseTextStyles,
          ...sizeTextStyles[size],
          color: colors.primary,
        };
      case 'ghost':
        return {
          ...baseTextStyles,
          ...sizeTextStyles[size],
          color: colors.primary,
        };
      default:
        return {
          ...baseTextStyles,
          ...sizeTextStyles[size],
          color: colors.onPrimary,
        };
    }
  };
  
  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();
  
  // Determine if we should use a gradient background
  // We'll use gradient on all platforms except web for performance reasons
  const useGradient = variant === 'primary' && Platform.OS !== 'web';
  
  // Define gradient colors based on the primary color
  // Using 'as const' to make it a readonly tuple as required by LinearGradient
  const gradientColors = [
    colors.primary, // Use primary color as base
    currentDayTheme?.colors?.secondary || colors.secondary,
    currentDayTheme?.colors?.primary || colors.primary
  ] as readonly [string, string, string];
  
  // Render button content
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={textStyles.color} />;
    }
    
    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        
        {typeof children === 'string' ? (
          <Text style={[textStyles, textStyle]}>{children}</Text>
        ) : (
          children
        )}
        
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };
  
  // Render button with or without gradient
  if (useGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[buttonStyles, style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  // Add web-specific styles for better mobile web experience
  const webStyles: ViewStyle = Platform.OS === 'web' ? {
    // Use any type assertion for web-specific CSS properties
    ...({
      cursor: disabled ? 'not-allowed' : 'pointer',
      WebkitTapHighlightColor: 'transparent',
      outline: 'none',
      userSelect: 'none',
      touchAction: 'manipulation'
    } as any)
  } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[buttonStyles, style, webStyles]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;