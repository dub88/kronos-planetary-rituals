import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from './ThemeProvider';

interface BackgroundPatternProps {
  opacity?: number;
  scale?: number;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  opacity = 0.05,
  scale = 1
}) => {
  const { currentDayTheme, colors, isDark } = useTheme();
 
  const percent = (value: number): `${number}%` => `${value}%` as `${number}%`;
  
  // Get pattern based on the day's theme
  const renderPattern = () => {
    if (!currentDayTheme || !currentDayTheme.patterns || !currentDayTheme.patterns.background) {
      return null;
    }
    
    const pattern = currentDayTheme.patterns.background;
    const patternColor = isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    
    if (pattern.includes('radial')) {
      return (
        <View style={[
          styles.sunburstPattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.sunburstRay, 
                { 
                  transform: [{ rotate: `${i * 30}deg` }],
                  backgroundColor: patternColor
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('waves')) {
      return (
        <View style={[
          styles.wavesPattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.wave, 
                { 
                  top: i * 40, 
                  borderColor: patternColor
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('forge')) {
      return (
        <View style={[
          styles.forgePattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.forgeSpark, 
                { 
                  left: percent(Math.random() * 100), 
                  top: percent(Math.random() * 100),
                  backgroundColor: patternColor,
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('circuit')) {
      return (
        <View style={[
          styles.circuitPattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.circuitLine, 
                { 
                  left: percent(Math.random() * 80 + 10), 
                  top: percent(i * 10),
                  width: Math.random() * 30 + 10,
                  backgroundColor: patternColor
                }
              ]} 
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View 
              key={i + 10} 
              style={[
                styles.circuitNode, 
                { 
                  left: percent(Math.random() * 80 + 10), 
                  top: percent(Math.random() * 80 + 10),
                  backgroundColor: patternColor
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('stars')) {
      return (
        <View style={[
          styles.starsPattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.star, 
                { 
                  left: percent(Math.random() * 100), 
                  top: percent(Math.random() * 100),
                  backgroundColor: patternColor,
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('petals')) {
      return (
        <View style={[
          styles.petalsPattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.petal, 
                { 
                  transform: [
                    { rotate: `${i * 30}deg` },
                    { translateY: -40 }
                  ],
                  backgroundColor: patternColor
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    if (pattern.includes('stone')) {
      return (
        <View style={[
          styles.stonePattern,
          { transform: [{ scale }] }
        ]}>
          {Array.from({ length: 15 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.stoneCrack, 
                { 
                  left: percent(Math.random() * 80 + 10), 
                  top: percent(Math.random() * 80 + 10),
                  width: Math.random() * 30 + 10,
                  transform: [{ rotate: `${Math.random() * 180}deg` }],
                  backgroundColor: patternColor
                }
              ]} 
            />
          ))}
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <View style={styles.container} pointerEvents="none">
      {renderPattern()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  // Sunburst pattern (Sun)
  sunburstPattern: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
  },
  sunburstRay: {
    position: 'absolute',
    width: 2,
    height: 100,
    left: 99,
    top: 0,
  },
  // Waves pattern (Moon)
  wavesPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: 20,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderRadius: 50,
  },
  // Forge pattern (Mars)
  forgePattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  forgeSpark: {
    position: 'absolute',
    borderRadius: 1,
  },
  // Circuit pattern (Mercury)
  circuitPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circuitLine: {
    position: 'absolute',
    height: 1,
  },
  circuitNode: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Stars pattern (Jupiter)
  starsPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    borderRadius: 0.5,
  },
  // Petals pattern (Venus)
  petalsPattern: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
  },
  petal: {
    position: 'absolute',
    width: 20,
    height: 40,
    left: 40,
    top: 50,
    borderRadius: 10,
  },
  // Stone pattern (Saturn)
  stonePattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  stoneCrack: {
    position: 'absolute',
    height: 1,
  },
});

export default BackgroundPattern;