import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import Card from '@/components/ui/Card';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { useRitualStore } from '@/stores/ritualStore';

// Define the Planet interface locally
interface Planet {
  id: string;
  name: string;
  day: string;
  color: string;
  candle: string;
  symbol: string;
  description: string;
  ritual: string;
}

// Define the PlanetPosition interface locally
interface PlanetPosition {
  planet: string;
  sign: string;
  isRetrograde: boolean;
}

interface TodaysRitualCardProps {
  planet: Planet;
  planetPosition?: PlanetPosition;
}

const TodaysRitualCard = ({ planet, planetPosition }: TodaysRitualCardProps) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { completedRituals } = useRitualStore();
  
  // Check if this ritual has been completed today
  const isCompletedToday = completedRituals?.some(ritual => {
    const ritualDate = new Date(ritual.completed_at);
    const today = new Date();
    return (
      ritual.ritual_id === planet.id &&
      ritualDate.getDate() === today.getDate() &&
      ritualDate.getMonth() === today.getMonth() &&
      ritualDate.getFullYear() === today.getFullYear()
    );
  });
  
  const handleStartRitual = () => {
    router.push(`/ritual/${planet.id}`);
  };

  const hexToRgb = (value: string) => {
    const hex = value.replace('#', '').trim();
    if (hex.length !== 6) return null;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  };

  const isLightColor = (value: string) => {
    const rgb = hexToRgb(value);
    if (!rgb) return false;
    const { r, g, b } = rgb;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.72;
  };

  const darkenHex = (value: string, amount: number) => {
    const rgb = hexToRgb(value);
    if (!rgb) return value;
    const clamp = (n: number) => Math.max(0, Math.min(255, n));
    const r = clamp(Math.round(rgb.r * (1 - amount)));
    const g = clamp(Math.round(rgb.g * (1 - amount)));
    const b = clamp(Math.round(rgb.b * (1 - amount)));
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getThemePlanetColor = (planetId: string) => {
    const v = (colors as unknown as Record<string, unknown>)[planetId];
    return typeof v === 'string' ? v : colors.primary;
  };

  const rawPlanetColor = getThemePlanetColor(planet.id);
  const accentColor = isDark && isLightColor(rawPlanetColor) ? darkenHex(rawPlanetColor, 0.28) : rawPlanetColor;
  const buttonBackgroundColor = isCompletedToday ? colors.success : accentColor;
  const buttonTextColor = isLightColor(buttonBackgroundColor) ? colors.onPrimary : 'white';

  const resolveCandleColor = () => {
    const lower = planet.candle.toLowerCase();
    const raw =
      lower.includes('orange') ? '#FF8C00' :
      lower.includes('yellow') ? '#FFD700' :
      lower.includes('white') ? '#F0F0F0' :
      lower.includes('red') ? '#FF0000' :
      lower.includes('blue') ? '#4B0082' :
      lower.includes('purple') ? '#4B0082' :
      lower.includes('green') ? '#00FF00' :
      lower.includes('black') ? '#000000' :
      accentColor;

    if (lower.includes('black')) {
      return isDark ? colors.text : raw;
    }

    if (!isDark && isLightColor(raw)) {
      return darkenHex(raw, 0.55);
    }

    if (isDark && raw === '#000000') {
      return colors.text;
    }

    if (isDark && isLightColor(raw)) {
      return darkenHex(raw, 0.25);
    }

    return raw;
  };

  const candleColor = resolveCandleColor();
  
  return (
    <Card variant="elevated" withGradient={isDark}>
      <View style={styles.content}>
        <View style={styles.header}>
          <PlanetSymbol 
            planetId={planet.id}
            size={32} 
            color={accentColor}
            variant={isCompletedToday ? "glowing" : "default"}
          />
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {planet.name} Ritual
            </Text>
            {planetPosition && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {planetPosition.sign} {planetPosition.isRetrograde ? '℞' : ''}
              </Text>
            )}
          </View>
        </View>
        
        <Text style={[styles.description, { color: colors.text }]}>
          {planet.ritual}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Candle:
            </Text>
            <Text 
              style={[
                styles.detailValue, 
                { color: candleColor }
              ]}
            >
              {planet.candle}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Day:
            </Text>
            <Text style={[styles.detailValue, { color: accentColor }]}>
              {planet.day}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonBackgroundColor,
              opacity: isCompletedToday ? 0.8 : 1,
            },
          ]}
          onPress={handleStartRitual}
          disabled={isCompletedToday}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>
            {isCompletedToday ? 'Completed Today' : 'Begin Ritual'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'System',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'System',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'System',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'System',
  },
});

export default TodaysRitualCard;