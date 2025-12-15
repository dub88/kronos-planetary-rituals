import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeProvider';

interface PlanetSymbolProps {
  planet?: string;
  planetId?: string;
  size?: number;
  color?: string;
  withBackground?: boolean;
  variant?: 'default' | 'glowing';
}

const PlanetSymbol: React.FC<PlanetSymbolProps> = ({ 
  planet, 
  planetId,
  size = 24, 
  color,
  withBackground = false,
  variant = 'default'
}) => {
  const { colors, currentDayTheme } = useTheme();
  
  // Determine which planet ID to use
  const actualPlanetId = planetId || planet || 'sun';
  
  // Get the symbol for the planet
  const getSymbol = () => {
    // First check if we have the current day theme and it matches the requested planet
    if (currentDayTheme && currentDayTheme.planetId === actualPlanetId && currentDayTheme.symbol) {
      return currentDayTheme.symbol;
    }
    
    // Otherwise use standard symbols
    switch (actualPlanetId) {
      case 'sun': return '☉';
      case 'moon': return '☽';
      case 'mercury': return '☿';
      case 'venus': return '♀';
      case 'mars': return '♂';
      case 'jupiter': return '♃';
      case 'saturn': return '♄';
      case 'uranus': return '♅';
      case 'neptune': return '♆';
      case 'pluto': return '♇';
      default: return '☉';
    }
  };
  
  // Get color for the planet
  const getColor = () => {
    if (color) return color;
    
    // If we have the current day theme and it matches the requested planet
    if (currentDayTheme && currentDayTheme.planetId === actualPlanetId && currentDayTheme.colors?.primary) {
      return currentDayTheme.colors.primary;
    }
    
    // Otherwise use standard colors
    return colors[actualPlanetId as keyof typeof colors] || colors.text;
  };
  
  // Get background gradient for the planet
  const getBackgroundColor = () => {
    // If we have the current day theme and it matches the requested planet
    if (currentDayTheme && currentDayTheme.planetId === planet && currentDayTheme.colors?.gradientStart) {
      return currentDayTheme.colors.gradientStart;
    }
    
    // Otherwise use a light version of the planet color
    return `${getColor()}20`;
  };
  
  const symbol = getSymbol();
  const symbolColor = getColor();
  const backgroundColor = getBackgroundColor();
  
  return (
    <View style={[
      styles.container,
      withBackground && [
        styles.withBackground,
        { backgroundColor, borderColor: `${symbolColor}40` }
      ],
      { width: size * 1.5, height: size * 1.5 }
    ]}>
      <Text style={[
        styles.symbol,
        { color: symbolColor, fontSize: size }
      ]}>
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  withBackground: {
    borderRadius: 100,
    borderWidth: 1,
  },
  symbol: {
    fontWeight: '400',
  },
});

export default PlanetSymbol;