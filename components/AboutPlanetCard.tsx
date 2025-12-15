import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { Planet, PlanetaryPosition } from '@/types';
import Card from '@/components/ui/Card';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { getPlanetaryDignity } from '@/utils/planetaryHours';
import { getZodiacSymbol } from '@/constants/dignities';
import { usePlanetaryStore } from '@/stores/planetaryStore';

interface AboutPlanetCardProps {
  planet: Planet;
  planetPosition?: PlanetaryPosition;
}

const AboutPlanetCard = ({ planet, planetPosition }: AboutPlanetCardProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Get the correct planetary position for the current planet
  // This ensures we're using the position for the specific planet being displayed
  const { planetPositions } = usePlanetaryStore();
  
  // Find the position for this specific planet
  const correctPlanetPosition = planetPositions && planetPositions.length > 0
    ? planetPositions.find((p: PlanetaryPosition) => p.planet.toLowerCase() === planet.id.toLowerCase())
    : planetPosition; // Fall back to provided position if we can't find a match
  
  // Use the correct position for this planet
  const positionToUse = correctPlanetPosition || planetPosition;
  
  // Get the planetary dignity if position is available
  const dignity = positionToUse && (
    planet.id === 'sun' ||
    planet.id === 'moon' ||
    planet.id === 'mercury' ||
    planet.id === 'venus' ||
    planet.id === 'mars' ||
    planet.id === 'jupiter' ||
    planet.id === 'saturn'
  ) ? getPlanetaryDignity(planet.id, positionToUse.sign) : null;
  const zodiacSymbol = positionToUse ? getZodiacSymbol(positionToUse.sign) : null;
  
  console.log(`AboutPlanetCard for ${planet.id}:`, positionToUse);
  
  // Helper function to get color based on dignity
  const getDignityColor = (dignity: string): string => {
    switch (dignity) {
      case 'rulership':
        return '#4CAF50';
      case 'exaltation':
        return '#2196F3';
      case 'detriment':
        return '#FF9800';
      case 'fall':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };
  
  return (
    <Card variant="elevated">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[
            styles.symbolContainer,
            { backgroundColor: `${planet.color}20` }
          ]}>
            <PlanetSymbol 
              planet={planet.id}
              size={40}
              color={planet.color}
              variant="glowing"
            />
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text, fontFamily: 'System' }]}>
              {planet.name}
            </Text>
            
            {planetPosition && (
              <View style={styles.positionContainer}>
                <Text style={[styles.position, { color: colors.textSecondary, fontFamily: 'System' }]}>
                  {zodiacSymbol} Currently in {planetPosition.sign} {planetPosition.isRetrograde ? '℞' : ''}
                </Text>
              </View>
            )}
          </View>
          
          {dignity && (
            <View style={[
              styles.dignityBadge,
              { backgroundColor: getDignityColor(dignity) }
            ]}>
              <Text style={[styles.dignityText, { fontFamily: 'System' }]}>
                {dignity}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.description, { color: colors.text, fontFamily: 'System' }]}>
          {planet.description}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, fontFamily: 'System' }]}>
              Day
            </Text>
            <Text style={[styles.infoValue, { color: colors.text, fontFamily: 'System' }]}>
              {planet.day}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, fontFamily: 'System' }]}>
              Candle
            </Text>
            <Text style={[styles.infoValue, { color: colors.text, fontFamily: 'System' }]}>
              {planet.candle}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { borderColor: colors.border }]}
          onPress={() => router.push(`/ritual/${planet.id}`)}
        >
          <Text style={[styles.buttonText, { color: colors.primary, fontFamily: 'System' }]}>
            Perform {planet.name} Ritual
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  symbolContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  position: {
    fontSize: 14,
  },
  dignityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  dignityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    marginRight: 24,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AboutPlanetCard;