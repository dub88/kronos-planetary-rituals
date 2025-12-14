import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { usePlanetaryStore } from '@/stores/planetaryStore';
import { useRitualStore } from '@/stores/ritualStore';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { getPlanetById } from '@/constants/planets';
import { hymns } from '@/constants/hymns';
import CandleAnimation from '@/components/CandleAnimation';
import { getZodiacSymbol } from '@/constants/dignities';
import { getPlanetaryDignity } from '@/utils/planetaryHours';
import type { PlanetDay } from '@/types';

export default function RitualScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { planetPositions, fetchPlanetaryPositions } = usePlanetaryStore();
  const { completeRitual } = useRitualStore();

  const asPlanetDay = (value: string): PlanetDay => {
    const valid: PlanetDay[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    return (valid as string[]).includes(value) ? (value as PlanetDay) : 'sun';
  };
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showHymn, setShowHymn] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Find the planet by ID with fallback
  const planetId = asPlanetDay((Array.isArray(id) ? id[0] : id) || 'sun');
  const planet = getPlanetById(planetId) || {
    id: planetId,
    name: planetId.charAt(0).toUpperCase() + planetId.slice(1),
    color: colors.primary,
    candle: 'White',
    description: 'A ritual to connect with planetary energies.',
  };
  
  // Find the hymn for this planet
  const hymn = hymns.find(h => h.planetId === planetId);
  
  // Find the current position of the planet
  const planetPosition = planetPositions.find(p => p.planet === planetId);
  
  // Get the planetary dignity if position is available
  const dignity = planetPosition ? getPlanetaryDignity(planetId, planetPosition.sign) : null;
  
  // Fetch planetary positions when the component mounts
  useEffect(() => {
    if (planetPositions.length === 0) {
      fetchPlanetaryPositions();
    }
  }, [fetchPlanetaryPositions, planetPositions.length]);
  
  // Define ritual steps
  const ritualSteps = [
    {
      title: "Preparation",
      description: `Find a quiet space where you won't be disturbed. If possible, use a ${planet.candle} candle to represent ${planet.name}'s energy.`,
    },
    {
      title: "Center Yourself",
      description: "Take a few deep breaths. Close your eyes and visualize a connection forming between you and the cosmic energy of the planet.",
    },
    {
      title: "Recite the Orphic Hymn",
      description: `Recite the Orphic Hymn to ${planet.name} to invoke its energy. You can read it aloud or silently.`,
    },
    {
      title: "Meditation",
      description: `Meditate on the qualities of ${planet.name}: ${planet.description ? planet.description.split('.')[0] : 'cosmic energy and planetary influence'}.`,
    },
    {
      title: "Set Intention",
      description: `State your intention for working with ${planet.name}'s energy today. What do you hope to manifest or understand?`,
    },
    {
      title: "Gratitude",
      description: `Express gratitude to ${planet.name} for its guidance and influence in your life.`,
    },
    {
      title: "Completion",
      description: "The ritual is complete. You may extinguish the candle if used, or let it burn out naturally.",
    },
  ];
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep < ritualSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHymn(false);
    } else {
      // Complete the ritual
      handleCompleteRitual();
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowHymn(false);
    }
  };
  
  // Toggle hymn visibility
  const toggleHymn = () => {
    setShowHymn(!showHymn);
  };
  
  // Handle ritual completion
  const handleCompleteRitual = async () => {
    try {
      setIsCompleting(true);
      
      await completeRitual({
        id: `${planetId}-${Date.now()}`,
        planetId: planetId,
        completedAt: new Date().toISOString(),
        notes: 'Completed the ritual successfully.',
      });
      
      // Navigate back to home screen
      router.push('/');
    } catch (error) {
      console.error('Error completing ritual:', error);
      Alert.alert(
        'Error',
        'Failed to complete the ritual. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCompleting(false);
    }
  };
  
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={16} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text, fontFamily: 'System' }]}>
              Exit Ritual
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleContainer}>
          <View style={[
            styles.symbolContainer,
            { backgroundColor: planet.color + '20' }
          ]}>
            <PlanetSymbol 
              planetId={planet.id}
              size={32}
              color={planet.color}
              variant="glowing"
            />
          </View>
          
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: colors.text, fontFamily: 'System' }]}>
              {planet.name} Ritual
            </Text>
            
            {planetPosition && (
              <View style={styles.positionContainer}>
                <Text style={[styles.position, { color: colors.textSecondary, fontFamily: 'System' }]}>
                  {getZodiacSymbol(planetPosition.sign)} Currently in {planetPosition.sign} {planetPosition.isRetrograde ? '℞' : ''}
                </Text>
                
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
            )}
          </View>
        </View>
        
        <View style={styles.candleContainer}>
          <CandleAnimation color={planet.color} planetId={planet.id} />
        </View>
        
        <Card variant="elevated" style={styles.stepCard}>
          <Text style={[styles.stepTitle, { color: colors.text, fontFamily: 'System' }]}>
            Step {currentStep + 1}: {ritualSteps[currentStep].title}
          </Text>
          
          <Text style={[styles.stepDescription, { color: colors.text, fontFamily: 'System' }]}>
            {ritualSteps[currentStep].description}
          </Text>
          
          {currentStep === 2 && hymn && (
            <View style={styles.hymnContainer}>
              <TouchableOpacity 
                style={[styles.hymnButton, { borderColor: colors.border }]}
                onPress={toggleHymn}
              >
                <Text style={[styles.hymnButtonText, { color: colors.primary, fontFamily: 'System' }]}>
                  {showHymn ? 'Hide Hymn' : 'Show Hymn'}
                </Text>
              </TouchableOpacity>
              
              {showHymn && (
                <ScrollView 
                  style={styles.hymnScroll}
                  contentContainerStyle={styles.hymnScrollContent}
                >
                  <Text style={[styles.hymnText, { color: colors.text, fontFamily: 'System' }]}>
                    {hymn.text}
                  </Text>
                </ScrollView>
              )}
            </View>
          )}
        </Card>
        
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.prevButton,
              { borderColor: colors.border, opacity: currentStep === 0 ? 0.5 : 1 }
            ]}
            onPress={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} color={colors.text} />
            <Text style={[styles.navButtonText, { color: colors.text, fontFamily: 'System' }]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.nextButton,
              { 
                backgroundColor: currentStep === ritualSteps.length - 1 ? colors.success : colors.primary,
              }
            ]}
            onPress={handleNextStep}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Text style={[styles.navButtonText, { color: 'white', fontFamily: 'System' }]}>
                Completing...
              </Text>
            ) : (
              <>
                <Text style={[styles.navButtonText, { color: 'white', fontFamily: 'System' }]}>
                  {currentStep === ritualSteps.length - 1 ? 'Complete Ritual' : 'Next Step'}
                </Text>
                {currentStep === ritualSteps.length - 1 ? (
                  <Check size={16} color="white" />
                ) : (
                  <ArrowRight size={16} color="white" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  backText: {
    marginLeft: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  symbolContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
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
    marginLeft: 8,
  },
  dignityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  candleContainer: {
    alignItems: 'center',
    marginBottom: 24,
    height: 120,
  },
  stepCard: {
    padding: 16,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  hymnContainer: {
    marginTop: 8,
  },
  hymnButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  hymnButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hymnScroll: {
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  hymnScrollContent: {
    padding: 12,
  },
  hymnText: {
    fontSize: 14,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  prevButton: {
    borderWidth: 1,
  },
  nextButton: {
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});