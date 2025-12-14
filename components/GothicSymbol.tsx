import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

interface GothicSymbolProps {
  symbol: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
  withBorder?: boolean;
}

const GothicSymbol = ({ 
  symbol, 
  size = 32, 
  color, 
  style,
  withBorder = false
}: GothicSymbolProps) => {
  const { colors, currentDayTheme } = useTheme();
  
  // Use provided color or fallback to theme color
  const symbolColor = color || currentDayTheme?.colors?.primary || colors.text;
  
  // Get border style based on the day's theme
  const getBorderStyle = () => {
    if (!withBorder) return {};
    
    if (!currentDayTheme || !currentDayTheme.motifs || !currentDayTheme.motifs.borderStyle) {
      return { borderColor: colors.border, borderWidth: 1 };
    }
    
    const borderStyle = currentDayTheme.motifs.borderStyle;
    
    if (borderStyle.includes('golden')) return { borderColor: '#D4AF37', borderWidth: 1.5 };
    if (borderStyle.includes('silver')) return { borderColor: '#C0C0C0', borderWidth: 1.5 };
    if (borderStyle.includes('iron')) return { borderColor: '#43464B', borderWidth: 2 };
    if (borderStyle.includes('alloy')) return { borderColor: '#A9A9A9', borderWidth: 1 };
    if (borderStyle.includes('tin')) return { borderColor: '#8A9597', borderWidth: 1.5 };
    if (borderStyle.includes('copper')) return { borderColor: '#B87333', borderWidth: 1.5 };
    if (borderStyle.includes('lead')) return { borderColor: '#2F4F4F', borderWidth: 2 };
    
    return { borderColor: colors.border, borderWidth: 1 };
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size * 1.5, 
          height: size * 1.5,
          borderRadius: size * 0.75,
          ...getBorderStyle()
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.symbol, 
          { 
            fontSize: size,
            color: symbolColor,
          }
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontFamily: 'System',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default GothicSymbol;