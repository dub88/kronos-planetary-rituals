import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Clock, Flame, Calendar, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import PlanetaryConstants, { chaldeanOrder, planetDayMap } from '@/constants/planets';
import { hymns } from '@/constants/hymns';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { getCurrentPlanetaryPositions, getPlanetaryDignity, PlanetaryDignity } from '@/app/services/astrology';
import { PlanetaryPosition, PlanetDay } from '@/types';
import { useTheme } from '@/components/ThemeProvider';

// Topics will be rendered with the current theme colors
const createTopics = (colors: any) => [
  {
    id: 'planetary-hours',
    title: 'Planetary Hours',
    icon: <Clock size={24} color={colors.text} />,
    description: 'Learn about the ancient system of planetary hours and how they influence magical workings.',
    content: `Planetary hours are an ancient astrological concept that divides each day into 24 unequal parts, each ruled by one of the seven classical planets.

The day begins at sunrise, and the daylight hours are divided into 12 equal parts. Similarly, the night (from sunset to sunrise) is divided into 12 equal parts. This means that the length of each planetary hour varies with the seasons, except at the equinoxes.

The first hour of each day is ruled by the planet for which the day is named:
- Sunday: Sun
- Monday: Moon
- Tuesday: Mars
- Wednesday: Mercury
- Thursday: Jupiter
- Friday: Venus
- Saturday: Saturn

The subsequent hours follow the Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, and Moon. This sequence repeats throughout the day.

Working with the appropriate planetary hour can significantly enhance the effectiveness of your magical workings.`
  },
  {
    id: 'orphic-hymns',
    title: 'Orphic Hymns',
    icon: <BookOpen size={24} color={colors.text} />,
    description: 'Discover the ancient Orphic Hymns and their use in planetary magic.',
    content: `The Orphic Hymns are a collection of 87 hymns composed in the late Hellenistic era (3rd or 2nd century BCE) and attributed to the legendary musician, poet, and prophet Orpheus.

These hymns were used in the mystery religions of ancient Greece and contain invocations to various deities and cosmic forces. They were designed to be sung during ritual ceremonies, often accompanied by offerings of incense.

The hymns dedicated to planetary deities are particularly valuable for planetary magic. They capture the essence and attributes of each planetary force in poetic form, making them powerful tools for invocation.

When recited during the corresponding planetary hour or day, these hymns help establish a connection with the planetary intelligence, enhancing the effectiveness of magical operations.

The language of the hymns is rich in symbolism and mythological references, providing insights into how the ancients perceived and worked with planetary energies.`
  },
  {
    id: 'ritual-basics',
    title: 'Ritual Basics',
    icon: <Flame size={24} color={colors.text} />,
    description: 'Learn the fundamentals of effective planetary rituals.',
    content: `Effective planetary rituals combine several elements to create a focused magical operation:

1. Timing: Working during the appropriate planetary day and hour significantly enhances the effectiveness of your ritual.

2. Space: Create a dedicated space for your ritual. This can be as simple as a small altar with symbols and colors corresponding to the planetary energy.

3. Tools and Offerings:
   - Candles in the appropriate color
   - Incense associated with the planet
   - Symbols or images representing the planetary energy
   - Crystals and herbs ruled by the planet

4. Invocation: Reciting the Orphic Hymn or another appropriate invocation helps establish a connection with the planetary intelligence.

5. Intent: Clearly define your purpose for working with the planetary energy. Different planets govern different aspects of life.

6. Meditation: After the invocation, spend time in meditation, visualizing the planetary energy and how it relates to your intention.

7. Closure: Thank the planetary intelligence and formally close the ritual.

Consistency in practice builds a stronger connection with planetary energies over time.`
  },
  {
    id: 'planetary-correspondences',
    title: 'Planetary Correspondences',
    icon: <Calendar size={24} color={colors.text} />,
    description: 'Explore the colors, herbs, incenses, and other correspondences for each planet.',
    content: `Each planet has a unique set of correspondences that can enhance your magical workings:

Sun ☉
- Colors: Gold, yellow, orange
- Herbs: Sunflower, marigold, cinnamon, bay laurel
- Incense: Frankincense, cinnamon, orange
- Crystals: Citrine, amber, tiger's eye
- Metal: Gold
- Day: Sunday

Moon ☽
- Colors: Silver, white, pale blue
- Herbs: Jasmine, camphor, cucumber, moonwort
- Incense: Jasmine, sandalwood, myrrh
- Crystals: Moonstone, selenite, pearl
- Metal: Silver
- Day: Monday

Mars ♂
- Colors: Red, scarlet
- Herbs: Ginger, pepper, dragon's blood, nettle
- Incense: Dragon's blood, tobacco, pepper
- Crystals: Ruby, bloodstone, garnet
- Metal: Iron
- Day: Tuesday

Mercury ☿
- Colors: Orange, violet, mixed colors
- Herbs: Lavender, marjoram, parsley, dill
- Incense: Lavender, clove, cinnamon
- Crystals: Agate, opal, aventurine
- Metal: Mercury, alloys
- Day: Wednesday

Jupiter ♃
- Colors: Purple, blue, indigo
- Herbs: Sage, nutmeg, hyssop, oak
- Incense: Cedar, nutmeg, sage
- Crystals: Amethyst, lapis lazuli, sapphire
- Metal: Tin
- Day: Thursday

Venus ♀
- Colors: Green, pink, copper
- Herbs: Rose, vanilla, cardamom, violet
- Incense: Rose, vanilla, musk
- Crystals: Rose quartz, emerald, jade
- Metal: Copper
- Day: Friday

Saturn ♄
- Colors: Black, dark blue, dark purple
- Herbs: Myrrh, cypress, comfrey, ivy
- Incense: Myrrh, cypress, patchouli
- Crystals: Onyx, obsidian, jet
- Metal: Lead
- Day: Saturday`
  },
];

export default function LearnScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const topics = React.useMemo(() => createTopics(colors), [colors]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedHymn, setSelectedHymn] = useState<string | null>(null);
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const renderTopicContent = () => {
    if (!selectedTopic) return null;
    
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return null;
    
    // Special case for Orphic Hymns - show list of hymns
    if (topic.id === 'orphic-hymns' && !selectedHymn) {
      return (
        <ScrollView style={styles.topicContent}>
          <View style={styles.topicHeader}>
            <View style={styles.topicIconContainer}>
              {topic.icon}
            </View>
            <Text style={[styles.topicTitle, { fontFamily: 'System' }]}>{topic.title}</Text>
          </View>
          <Text style={[styles.topicText, { fontFamily: 'System', color: isDark ? colors.text : 'black' }]}>
            {topic.content}
          </Text>
          
          <View style={styles.hymnsList}>
            <Text style={[styles.hymnsListTitle, { fontFamily: 'System' }]}>
              View Orphic Hymns by Planet:
            </Text>
            
            {chaldeanOrder.map(planetId => (
              <TouchableOpacity
                key={planetId}
                style={styles.hymnItem}
                onPress={() => router.push(`/hymn/${planetId}`)}
              >
                <PlanetSymbol 
                  planet={planetId} 
                  size={24} 
                  color={colors.text} 
                />
                <Text style={[styles.hymnItemText, { fontFamily: 'System' }]}>
                  Hymn to {PlanetaryConstants.getPlanetById(planetId).name}
                </Text>
                <ArrowRight size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedTopic(null)}
          >
            <Text style={[styles.backButtonText, { fontFamily: 'System', color: colors.text }]}>Back to Topics</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    
    return (
      <ScrollView style={styles.topicContent}>
        <View style={styles.topicHeader}>
          <View style={styles.topicIconContainer}>
            {topic.icon}
          </View>
          <Text style={[styles.topicTitle, { fontFamily: 'System' }]}>{topic.title}</Text>
        </View>
        <Text style={[styles.topicText, { fontFamily: 'System', color: colors.text }]}>{topic.content}</Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedTopic(null)}
        >
          <Text style={[styles.backButtonText, { fontFamily: 'System', color: colors.text }]}>Back to Topics</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  // Get current date to determine day/night
  const today = new Date();
  const isDay = today.getHours() >= 6 && today.getHours() < 18; // Simple day/night check
  
  // Function to get the planetary ruler of the current day
  const getPlanetaryDayRuler = (): string => {
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Classical planetary rulers of the days of the week
    switch (dayOfWeek) {
      case 0: return 'sun';     // Sunday
      case 1: return 'moon';    // Monday
      case 2: return 'mars';    // Tuesday
      case 3: return 'mercury'; // Wednesday
      case 4: return 'jupiter'; // Thursday
      case 5: return 'venus';   // Friday
      case 6: return 'saturn';  // Saturday
      default: return 'sun';    // Fallback
    }
  };
  
  // Fetch planetary positions from the API
  useEffect(() => {
    const fetchPlanetaryData = async () => {
      try {
        setIsLoading(true);
        const positions = await getCurrentPlanetaryPositions();
        setPlanetaryPositions(positions);
      } catch (error) {
        console.error('Error fetching planetary positions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlanetaryData();
  }, []);
  
  // Get the current dignity for a planet based on its position
  const getCurrentDignity = (planetId: string): PlanetaryDignity | null => {
    const position = planetaryPositions.find(p => p.planet === planetId);
    if (!position) return null;
    
    return getPlanetaryDignity(planetId, position.sign);
  };
  
  // Helper function to get color based on dignity status
  const getDignityColor = (status: string): string => {
    switch (status) {
      case 'Domicile':
      case 'Exaltation':
        return colors.success;
      case 'Detriment':
      case 'Fall':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  const renderPlanetsList = () => {
    return (
      <View style={styles.planetsSection}>
        <Text style={[styles.sectionTitle, { fontFamily: 'System' }]}>Current Planetary Dignities</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { fontFamily: 'System' }]}>Loading planetary positions...</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.planetsScrollContent}
          >
            {chaldeanOrder.map(planetId => {
              const position = planetaryPositions.find(p => p.planet === planetId);
              const dignity = position ? getCurrentDignity(planetId) : null;
              const planetInfo = PlanetaryConstants.getPlanetById(planetId);
              const planetColor = planetId; // Use the planet ID for color reference
              const planetSymbol = PlanetaryConstants.getPlanetById(planetId).symbol;
              
              return (
                <View
                  key={planetId}
                  style={[
                    styles.planetCard, 
                    { 
                      backgroundColor: colors.surface,
                      borderColor: planetInfo.color || colors.text,
                      borderWidth: 2,
                    },
                    dignity?.status === 'Domicile' || dignity?.status === 'Exaltation' ? styles.rulerPlanetCard : null
                  ]}
                >
                  <Text style={[
                    styles.planetSymbol, 
                    { 
                      fontFamily: 'System',
                      color: planetInfo.color || colors.text
                    }
                  ]}>{planetSymbol}</Text>
                  
                  <Text style={[
                    styles.planetName, 
                    { 
                      fontFamily: 'System',
                      color: colors.text
                    }
                  ]}>{planetInfo.name}</Text>
                  
                  {position && (
                    <Text style={[
                      styles.signPosition, 
                      { 
                        fontFamily: 'System',
                        color: colors.text,
                        marginBottom: 4
                      }
                    ]}>
                      In {position.sign}
                    </Text>
                  )}
                  
                  {position && position.isRetrograde && (
                    <Text style={[
                      styles.retrograde, 
                      { 
                        fontFamily: 'System',
                        color: colors.error
                      }
                    ]}>Retrograde</Text>
                  )}
                  
                  {dignity && dignity.status !== 'Peregrine' && (
                    <Text style={[
                      styles.dignityType, 
                      { 
                        fontFamily: 'System',
                        color: getDignityColor(dignity.status)
                      }
                    ]}>
                      {dignity.status}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };
  
  const renderTopicsList = () => {
    return (
      <>
        <Text style={[styles.sectionTitle, { fontFamily: 'System' }]}>Learning Topics</Text>
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setSelectedTopic(topic.id)}
          >
            <View style={styles.topicCardContent}>
              <View style={[styles.topicIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                {topic.icon}
              </View>
              <View style={styles.topicCardText}>
                <Text style={[styles.topicCardTitle, { fontFamily: 'System', color: colors.text }]}>{topic.title}</Text>
                <Text style={[styles.topicCardDescription, { fontFamily: 'System', color: colors.text }]}>{topic.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };
  
  // Create styles with current theme colors
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedTopic ? (
          renderTopicContent()
        ) : (
          <>
            {renderPlanetsList()}
            {renderTopicsList()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  planetsSection: {
    marginBottom: 24,
  },
  planetsScrollContent: {
    paddingRight: 16,
  },
  planetCard: {
    width: 110,
    height: 160,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  planetSymbol: {
    fontSize: 32,
    marginBottom: 8,
  },
  planetName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retrograde: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planetDay: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  dignityType: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dignityDesc: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  rulerPlanetCard: {
    borderWidth: 3,
  },
  topicCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  topicCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicCardText: {
    flex: 1,
  },
  topicCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  topicCardDescription: {
    fontSize: 14,
    color: colors.text,
  },
  topicContent: {
    flex: 1,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    color: colors.text,
  },
  topicText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  hymnsList: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  hymnsListTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hymnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  hymnItemText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  signPosition: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});