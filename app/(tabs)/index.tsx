import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { usePlanetaryStore } from '@/stores/planetaryStore';
import { useLocationStore } from '@/stores/locationStore';
import { useRitualStore } from '@/stores/ritualStore';
import Container from '@/components/ui/Container';
import Title from '@/components/ui/Title';
import PlanetaryHourCard from '@/components/PlanetaryHourCard';
import { getPlanetaryDayRuler } from '@/utils/planetaryHours';
import { getPlanetById } from '@/constants/planets';
import type { Planet as AppPlanet } from '@/app/types/index';
import AboutPlanetCard from '@/components/AboutPlanetCard';
import TodaysRitualCard from '@/components/TodaysRitualCard';
import { AlertCircle } from 'lucide-react-native';
import LocationPrompt from '@/components/LocationPrompt';
import KronosLogo from '@/components/KronosLogo';
import PlanetSymbol from '@/components/ui/PlanetSymbol';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, currentDayTheme } = useTheme();
  const { fetchPlanetaryPositions, planetPositions } = usePlanetaryStore();
  const { location, hasPromptedForLocation, setHasPromptedForLocation } = useLocationStore();
  const { fetchRituals, fetchCompletedRituals, error } = useRitualStore();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Fetch data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPlanetaryPositions();
        await fetchRituals();
        await fetchCompletedRituals();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Show location prompt if not prompted before
    if (!hasPromptedForLocation) {
      setShowLocationPrompt(true);
    }
  }, [fetchPlanetaryPositions, fetchRituals, fetchCompletedRituals, hasPromptedForLocation]);
  
  // Get the day's ruling planet for rituals - with error handling
  const today = new Date(); // Use the actual current date
  const dayRulerPlanetId = getPlanetaryDayRuler(today);
  // Ensure the planet object has all required properties including ritual as a string
  const dayRulerPlanet = dayRulerPlanetId ? {
    ...getPlanetById(dayRulerPlanetId),
    // Ensure ritual is always a string (not undefined)
    ritual: getPlanetById(dayRulerPlanetId)?.ritual || ''
  } : null;
  
  // Find the current position of the day's ruling planet - with error handling
  const dayRulerPosition = dayRulerPlanetId && planetPositions && planetPositions.length > 0 
    ? planetPositions.find(p => p.planet.toLowerCase() === dayRulerPlanetId.toLowerCase()) 
    : null;
  
  const handleLocationPromptClose = () => {
    setShowLocationPrompt(false);
    setHasPromptedForLocation(true);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container withPattern>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <KronosLogo size={56} />
              <View style={styles.heroTextCol}>
                <Text style={[styles.heroKicker, { color: colors.textSecondary }]}>Today</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {currentDayTheme.name} Day
                </Text>
              </View>
              <View style={[styles.heroOrb, { backgroundColor: `${colors.primary}14`, borderColor: colors.border }]}> 
                <PlanetSymbol planetId={currentDayTheme.planetId} size={28} variant="glowing" />
              </View>
            </View>

            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Your ritual focus and planetary hours—at a glance.
            </Text>
          </View>
          
          {/* Daily Practice heading removed as requested */}
          
          {/* Error message if there's an error */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` }]}> 
              <AlertCircle size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}
          
          {/* About Planet Card - Showing day's ruling planet - MOVED TO TOP */}
          <View style={styles.section}>
            <Title 
              title={`Today's Ruling Planet: ${dayRulerPlanet?.name || 'Sun'}`} 
              style={styles.sectionTitle}
            />
            {dayRulerPlanet && (
              <AboutPlanetCard 
                planet={dayRulerPlanet} 
                planetPosition={dayRulerPosition || undefined} 
              />
            )}
          </View>
          
          {/* Today's Ritual Card - Using day's ruling planet */}
          <View style={styles.section}>
            <Title 
              title={`${dayRulerPlanet?.name || 'Sun'} Ritual`}
              style={styles.sectionTitle}
            />
            {dayRulerPlanet && (
              <TodaysRitualCard 
                planet={dayRulerPlanet} 
                planetPosition={dayRulerPosition || undefined}
              />
            )}
          </View>
          
          <View style={styles.section}>
            <Title 
              title="Planetary Hours" 
              style={styles.sectionTitle}
            />
            <PlanetaryHourCard />
          </View>
        </ScrollView>
      </Container>
      
      {showLocationPrompt && (
        <LocationPrompt 
          visible={showLocationPrompt}
          onClose={handleLocationPromptClose}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 12,
  },
  hero: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
  },
  heroTextCol: {
    flex: 1,
  },
  heroKicker: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  heroOrb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});