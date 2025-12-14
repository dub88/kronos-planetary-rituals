import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

interface DayThemeIndicatorProps {
  compact?: boolean;
  onPress?: () => void;
}

const DayThemeIndicator = ({ compact = false, onPress }: DayThemeIndicatorProps) => {
  const { currentDayTheme, colors } = useTheme();
  
  const Container = onPress ? TouchableOpacity : View;
  
  // Get border style based on the day's theme with error handling
  const getBorderStyle = () => {
    try {
      if (!currentDayTheme || !currentDayTheme.motifs || !currentDayTheme.motifs.borderStyle) {
        return { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 };
      }
      
      const borderStyle = currentDayTheme.motifs.borderStyle;
      
      if (borderStyle.includes('golden')) return { borderColor: '#D4AF37', borderWidth: 1.5 };
      if (borderStyle.includes('silver')) return { borderColor: '#C0C0C0', borderWidth: 1.5 };
      if (borderStyle.includes('iron')) return { borderColor: '#43464B', borderWidth: 2 };
      if (borderStyle.includes('alloy')) return { borderColor: '#A9A9A9', borderWidth: 1 };
      if (borderStyle.includes('tin')) return { borderColor: '#8A9597', borderWidth: 1.5 };
      if (borderStyle.includes('copper')) return { borderColor: '#B87333', borderWidth: 1.5 };
      if (borderStyle.includes('lead')) return { borderColor: '#2F4F4F', borderWidth: 2 };
      
      return { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 };
    } catch (error) {
      console.error('Error in getBorderStyle:', error);
      return { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 };
    }
  };
  
  const borderStyle = getBorderStyle();
  
  // Safely get gradient colors with fallback
  const gradientColors = (() => {
    const g = currentDayTheme?.gradient;
    if (g && g.length >= 2) {
      return [g[0], g[1], ...g.slice(2)] as [string, string, ...string[]];
    }
    return ['#FFFFFF', '#EEEEEE'] as [string, string];
  })();
  
  // Safely get symbol with fallback
  const symbol = currentDayTheme?.symbol || 
                (currentDayTheme?.motifs?.symbol || '☉');
  
  // Safely get name with fallback
  const name = currentDayTheme?.name || 'the Planet';
  
  // Safely get correspondences with fallback
  const correspondenceColors = currentDayTheme?.correspondences?.colors || ['Gold', 'Yellow'];
  
  // Safely get accent element with fallback
  const getAccentElement = () => {
    try {
      if (!currentDayTheme || !currentDayTheme.motifs || !currentDayTheme.motifs.accentElement) {
        return '✧';
      }
      
      const accentElement = currentDayTheme.motifs.accentElement;
      
      if (accentElement.includes('sunflower')) return '✿';
      if (accentElement.includes('jasmine')) return '❀';
      if (accentElement.includes('dragon')) return '🔥';
      if (accentElement.includes('lavender')) return '❇';
      if (accentElement.includes('sage')) return '⚜';
      if (accentElement.includes('rose')) return '✿';
      if (accentElement.includes('cypress')) return '✧';
      
      return '✧';
    } catch (error) {
      console.error('Error in getAccentElement:', error);
      return '✧';
    }
  };
  
  const accentElement = getAccentElement();
  
  if (compact) {
    return (
      <Container 
        style={[styles.compactContainer, borderStyle]}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.compactGradient}
        >
          <Text style={styles.compactSymbol}>{symbol}</Text>
        </LinearGradient>
      </Container>
    );
  }
  
  return (
    <Container 
      style={[styles.container, borderStyle]}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.symbol}>{symbol}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Day of {name}</Text>
            <Text style={styles.subtitle}>
              {correspondenceColors.join(' • ')}
            </Text>
          </View>
          <Text style={styles.accentElement}>{accentElement}</Text>
        </View>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 24,
    marginRight: 12,
    color: 'rgba(0,0,0,0.7)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
  },
  accentElement: {
    fontSize: 18,
    color: 'rgba(0,0,0,0.7)',
  },
  // Compact styles
  compactContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  compactGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactSymbol: {
    fontSize: 18,
    color: 'rgba(0,0,0,0.7)',
  },
});

export default DayThemeIndicator;