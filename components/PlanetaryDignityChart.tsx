import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { usePlanetaryStore } from '@/stores/planetaryStore';
import Card from '@/components/ui/Card';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { planets } from '@/constants/planets';
import { Info } from 'lucide-react-native';
import { getPlanetaryDignity } from '@/utils/planetaryHours';
import { getZodiacSymbol } from '@/constants/dignities';

const PlanetaryDignityChart = () => {
  const { colors } = useTheme();
  const { planetPositions, fetchPlanetaryPositions } = usePlanetaryStore();
  const [showInfo, setShowInfo] = useState(false);
  
  // Fetch planetary positions if not already loaded
  useEffect(() => {
    if (planetPositions.length === 0) {
      fetchPlanetaryPositions();
    }
  }, [fetchPlanetaryPositions, planetPositions.length]);
  
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };
  
  // Helper function to get color based on dignity
  const getDignityColor = (dignity: string): string => {
    switch (dignity) {
      case 'Domicile':
        return '#4CAF50';
      case 'Exaltation':
        return '#2196F3';
      case 'Detriment':
        return '#FF9800';
      case 'Fall':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };
  
  return (
    <Card variant="elevated">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'System' }]}>
          Current Planetary Dignities
        </Text>
        <TouchableOpacity 
          style={[styles.infoButton, { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1 }]}
          onPress={toggleInfo}
        >
          <Info size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {showInfo && (
        <View style={[styles.infoBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.text, fontFamily: 'System' }]}>
            Planetary dignities show the strength of a planet in a particular zodiac sign:
          </Text>
          <View style={styles.dignityLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDignityColor('Domicile') }]} />
              <Text style={[styles.legendText, { color: colors.text, fontFamily: 'System' }]}>
                Domicile: Planet is at home and strongest
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDignityColor('Exaltation') }]} />
              <Text style={[styles.legendText, { color: colors.text, fontFamily: 'System' }]}>
                Exaltation: Planet is honored and powerful
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDignityColor('Detriment') }]} />
              <Text style={[styles.legendText, { color: colors.text, fontFamily: 'System' }]}>
                Detriment: Planet is uncomfortable and weak
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDignityColor('Fall') }]} />
              <Text style={[styles.legendText, { color: colors.text, fontFamily: 'System' }]}>
                Fall: Planet is in its lowest state
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.chartContainer}>
          {planets.map(planet => {
            const position = planetPositions.find(p => p.planet === planet.id);
            const dignity = position ? getPlanetaryDignity(planet.id, position.sign) : null;
            const zodiacSymbol = position ? getZodiacSymbol(position.sign) : null;
            
            return (
              <View key={planet.id} style={styles.planetColumn}>
                <View style={[styles.planetHeader, { borderBottomColor: colors.border }]}>
                  <PlanetSymbol 
                    planetId={planet.id} 
                    size={24} 
                    color={planet.color} 
                  />
                  <Text style={[styles.planetName, { color: colors.text, fontFamily: 'System' }]}>
                    {planet.name}
                  </Text>
                </View>
                
                <View style={styles.positionContainer}>
                  {position ? (
                    <>
                      <Text style={[styles.zodiacSymbol, { color: colors.text, fontFamily: 'System' }]}>
                        {zodiacSymbol}
                      </Text>
                      <Text style={[styles.signText, { color: colors.text, fontFamily: 'System' }]}>
                        {position.sign}
                      </Text>
                      {position.isRetrograde && (
                        <Text style={[styles.retrogradeText, { color: colors.warning, fontFamily: 'System' }]}>
                          ℞
                        </Text>
                      )}
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
                    </>
                  ) : (
                    <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: 'System' }]}>
                      Loading...
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  dignityLegend: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  scrollView: {
    paddingBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  planetColumn: {
    width: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  planetHeader: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  planetName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  positionContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  zodiacSymbol: {
    fontSize: 20,
    marginBottom: 4,
  },
  signText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  retrogradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dignityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  dignityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default PlanetaryDignityChart;