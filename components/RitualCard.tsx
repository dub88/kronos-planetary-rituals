import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface RitualCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  planetaryDay?: string;
}

const RitualCard = ({ 
  id, 
  title, 
  description, 
  duration, 
  difficulty, 
  planetaryDay 
}: RitualCardProps) => {
  const { currentDayTheme, colors, isDark } = useTheme();
  const router = useRouter();
  
  // Safely get border radius with fallback
  const borderRadius = currentDayTheme?.ui?.cardBorderRadius || 16;
  
  // Get difficulty color
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50'; // Green
      case 'intermediate':
        return '#FF9800'; // Orange
      case 'advanced':
        return '#F44336'; // Red
      default:
        return '#4CAF50';
    }
  };
  
  // Get difficulty flames
  const getDifficultyFlames = () => {
    switch (difficulty) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      default:
        return 1;
    }
  };
  
  const handlePress = () => {
    router.push(`/ritual/${id}`);
  };

  const gradientColors = (() => {
    const g = currentDayTheme?.gradient;
    if (g && g.length >= 2) {
      return [g[0], g[1], ...g.slice(2)] as [string, string, ...string[]];
    }
    return ['#FFFFFF', '#EEEEEE'] as [string, string];
  })();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          borderRadius,
          backgroundColor: isDark ? colors.surface : colors.background,
          borderColor: colors.border,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={gradientColors}
        style={[styles.header, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
      >
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
      
      {/* Content */}
      <View style={styles.content}>
        <Text 
          style={[styles.description, { color: colors.text }]}
          numberOfLines={2}
        >
          {description}
        </Text>
        
        {/* Footer */}
        <View style={styles.footer}>
          {/* Duration */}
          <View style={styles.infoItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {duration}
            </Text>
          </View>
          
          {/* Difficulty */}
          <View style={styles.infoItem}>
            <View style={styles.difficultyContainer}>
              {Array.from({ length: getDifficultyFlames() }).map((_, index) => (
                <Flame 
                  key={index} 
                  size={16} 
                  color={getDifficultyColor()} 
                  style={{ marginRight: index < getDifficultyFlames() - 1 ? -8 : 0 }}
                />
              ))}
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RitualCard;