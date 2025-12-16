import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Image, Modal, FlatList, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useProfileStore } from '@/stores/profileStore';
import { useLocationStore } from '@/stores/locationStore';
import { useRitualStore } from '@/stores/ritualStore';
import { useSettingsStore } from '@/stores/settingsStore';
import ProfileAvatar from '@/components/ProfileAvatar';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import KronosLogo from '@/components/KronosLogo';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { MapPin, Calendar, BookOpen, Award, Settings, Edit2, AlertCircle, Moon, Sun, Star, ChevronDown, X } from 'lucide-react-native';
import { formatDate } from '@/utils/dateUtils';
import LocationPrompt from '@/components/LocationPrompt';
import { formatLocation } from '@/utils/locationUtils';
import { Location } from '@/types';
import { getPlanetaryDayRuler } from '@/utils/planetaryHours';
import { ZodiacInfo, LocationInfo } from '@/app/types/database';

// Zodiac sign data
const zodiacSigns = [
  { id: 'aries', name: 'Aries', symbol: '♈', element: 'fire' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', element: 'earth' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', element: 'air' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', element: 'water' },
  { id: 'leo', name: 'Leo', symbol: '♌', element: 'fire' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'earth' },
  { id: 'libra', name: 'Libra', symbol: '♎', element: 'air' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'water' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'fire' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'earth' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'air' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', element: 'water' },
];

export default function ProfileScreen() {
  const { colors, currentDayTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, error: profileError } = useProfileStore();
  const { location, setLocation } = useLocationStore();
  const { completedRituals: ritualLogs, fetchCompletedRituals, error: ritualsError } = useRitualStore();
  const { settings, updateSettings, error: settingsError } = useSettingsStore();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showSignSelector, setShowSignSelector] = useState(false);
  const [signType, setSignType] = useState<'sun' | 'moon' | 'rising'>('sun');
  
  // User's astrological signs (initialize from settings or with defaults)
  const [sunSign, setSunSign] = useState(settings?.location?.zodiac?.sunSign || 'aries');
  const [moonSign, setMoonSign] = useState(settings?.location?.zodiac?.moonSign || 'taurus');
  const [risingSign, setRisingSign] = useState(settings?.location?.zodiac?.risingSign || 'gemini');
  
  // Get the current day's ruling planet for theming
  const today = new Date();
  const dayRulerPlanetId = getPlanetaryDayRuler(today);
  
  useEffect(() => {
    // Fetch completed rituals when the component mounts
    if (fetchCompletedRituals) {
      fetchCompletedRituals();
    }
  }, [fetchCompletedRituals]);
  
  // Update local state when settings change
  useEffect(() => {
    if (settings?.location?.zodiac) {
      setSunSign(settings.location.zodiac.sunSign || 'aries');
      setMoonSign(settings.location.zodiac.moonSign || 'taurus');
      setRisingSign(settings.location.zodiac.risingSign || 'gemini');
    }
  }, [settings]);
  
  // Save user's astrological sign selections to settings
  const saveSignSelection = (sign: string) => {
    if (!updateSettings || !settings) return;
    
    // Create a copy of the current zodiac settings
    const zodiacSettings: ZodiacInfo = settings.location?.zodiac || { sunSign: 'aries', moonSign: 'taurus', risingSign: 'gemini' };
    
    // Update the appropriate sign
    if (signType === 'sun') {
      setSunSign(sign);
      zodiacSettings.sunSign = sign;
    } else if (signType === 'moon') {
      setMoonSign(sign);
      zodiacSettings.moonSign = sign;
    } else if (signType === 'rising') {
      setRisingSign(sign);
      zodiacSettings.risingSign = sign;
    }
    
    // Create a new location object with the updated zodiac info
    const updatedLocation: LocationInfo = {
      ...(settings.location || {}),
      zodiac: zodiacSettings
    };
    
    // Update the settings with the new location information
    updateSettings({
      location: updatedLocation
    });
    
    setShowSignSelector(false);
  };
  
  const handleLocationUpdate = () => {
    setShowLocationPrompt(true);
  };
  
  const handleLocationSelected = (newLocation: Location) => {
    if (setLocation) {
      setLocation(newLocation);
    }
    setShowLocationPrompt(false);
  };
  
  // Format location name manually if formatLocation is not available
  const getLocationDisplay = () => {
    if (!location) return 'Location not set';
    
    if (location.name) {
      return location.name;
    } else if (location.latitude && location.longitude) {
      return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
    } else {
      return 'Location not set';
    }
  };
  
  // We'll calculate achievements dynamically based on user progress
  
  // Handle opening the sign selector modal
  const openSignSelector = (type: 'sun' | 'moon' | 'rising') => {
    setSignType(type);
    setShowSignSelector(true);
  };
  
  // Get the zodiac sign object by ID
  const getZodiacSignById = (id: string) => {
    return zodiacSigns.find(sign => sign.id === id) || zodiacSigns[0];
  };
  
  // Calculate achievement progress
  const calculateAchievements = () => {
    // First ritual achievement
    const hasCompletedRitual = ritualLogs && ritualLogs.length > 0;
    
    // Count unique planets in ritual logs
    const planetCounts: Record<string, number> = {};
    if (ritualLogs && ritualLogs.length > 0) {
      ritualLogs.forEach((log: any) => {
        const planetId = log.ritual_id?.split('_')[0];
        if (planetId) {
          planetCounts[planetId] = (planetCounts[planetId] || 0) + 1;
        }
      });
    }
    
    const uniquePlanets = Object.keys(planetCounts);
    const moonRituals = planetCounts['moon'] || 0;
    const sunRituals = planetCounts['sun'] || 0;
    const allPlanetsComplete = uniquePlanets.length >= 7;
    
    return {
      hasCompletedRitual,
      uniquePlanets,
      uniquePlanetsCount: uniquePlanets.length,
      moonRituals,
      sunRituals,
      allPlanetsComplete
    };
  };
  
  const achievementData = calculateAchievements();
  
  // Render the appropriate icon based on achievement type
  const renderAchievementIcon = (iconName: string) => {
    switch(iconName) {
      case 'moon':
        return <Moon size={16} color={currentDayTheme.colors.primary} />;
      case 'sun':
        return <Sun size={16} color={currentDayTheme.colors.primary} />;
      case 'star':
        return <Star size={16} color={currentDayTheme.colors.primary} />;
      case 'calendar':
        return <Calendar size={16} color={currentDayTheme.colors.primary} />;
      default:
        return <Award size={16} color={currentDayTheme.colors.primary} />;
    }
  };
  
  // Name and bio editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');

  // Save profile edits
  const saveProfileEdits = () => {
    if (!updateProfile || !profile) return;
    
    updateProfile({
      ...profile,
      name: editName,
      bio: editBio
    });
    
    setIsEditingProfile(false);
  };

  const scrollPaddingBottom = 40 + 66 + 14 + insets.bottom;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container withPattern>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <KronosLogo size={56} />
              <View style={styles.heroTextCol}>
                <Text style={[styles.heroKicker, { color: colors.textSecondary }]}>Profile</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {profile?.name || 'Your Profile'}
                </Text>
              </View>
              <View style={[styles.heroOrb, { backgroundColor: `${colors.primary}14`, borderColor: colors.border }]}> 
                <PlanetSymbol planetId={currentDayTheme.planetId} size={28} variant="glowing" />
              </View>
            </View>
          </View>
        
        {/* Error message if there's an error */}
        {(profileError || ritualsError || settingsError) && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
            <AlertCircle size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {profileError || ritualsError || settingsError}
            </Text>
          </View>
        )}
        
        {/* Profile Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.profileCard}
        >
          <View style={styles.profileContent}>
            {!isEditingProfile ? (
              <>
                <View style={styles.profileHeader}>
                  
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>
                      {profile?.name || 'Cosmic Seeker'}
                    </Text>
                    
                    <Text style={[styles.profileBio, { color: colors.textSecondary }]}>
                      {profile?.bio || 'A seeker of cosmic wisdom'}
                    </Text>
                    
                    <View style={styles.joinedContainer}>
                      <Calendar size={12} color={colors.textTertiary} />
                      <Text style={[styles.joinedText, { color: colors.textTertiary }]}>
                        Joined {profile?.created_at ? formatDate(new Date(profile.created_at)) : 'the cosmic journey'}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.editButton, { backgroundColor: `${currentDayTheme.colors.primary}10` }]}
                    onPress={() => {
                      setEditName(profile?.name || '');
                      setEditBio(profile?.bio || '');
                      setIsEditingProfile(true);
                    }}
                  >
                    <Edit2 size={16} color={currentDayTheme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.editProfileContainer}>
                <View style={styles.editFieldContainer}>
                  <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Name</Text>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                
                <View style={styles.editFieldContainer}>
                  <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Bio</Text>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="A short bio about yourself"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => setIsEditingProfile(false)}
                  >
                    <Text style={{ color: colors.text }}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: currentDayTheme.colors.primary }]}
                    onPress={saveProfileEdits}
                  >
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Card>
        
        {/* Astrological Signs Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.astroSignsCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
              <Star size={18} color={currentDayTheme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Astrological Signs
            </Text>
          </View>
          
          <View style={styles.signsList}>
            {/* Sun Sign */}
            <TouchableOpacity 
              style={styles.signItem} 
              onPress={() => openSignSelector('sun')}
            >
              <View style={[styles.signIconContainer, { backgroundColor: `${currentDayTheme.colors.primary}15` }]}>
                <Sun size={16} color={currentDayTheme.colors.primary} />
              </View>
              <View style={styles.signDetails}>
                <Text style={[styles.signLabel, { color: colors.textSecondary }]}>Sun Sign</Text>
                <View style={styles.signValueContainer}>
                  <Text style={[styles.signValue, { color: colors.text }]}>
                    {getZodiacSignById(sunSign).name}
                  </Text>
                  <Text style={styles.signSymbol}>{getZodiacSignById(sunSign).symbol}</Text>
                  <ChevronDown size={14} color={colors.textTertiary} style={styles.signChevron} />
                </View>
              </View>
            </TouchableOpacity>
            

            
            {/* Moon Sign */}
            <TouchableOpacity 
              style={styles.signItem} 
              onPress={() => openSignSelector('moon')}
            >
              <View style={[styles.signIconContainer, { backgroundColor: `${currentDayTheme.colors.primary}15` }]}>
                <Moon size={16} color={currentDayTheme.colors.primary} />
              </View>
              <View style={styles.signDetails}>
                <Text style={[styles.signLabel, { color: colors.textSecondary }]}>Moon Sign</Text>
                <View style={styles.signValueContainer}>
                  <Text style={[styles.signValue, { color: colors.text }]}>
                    {getZodiacSignById(moonSign).name}
                  </Text>
                  <Text style={styles.signSymbol}>{getZodiacSignById(moonSign).symbol}</Text>
                  <ChevronDown size={14} color={colors.textTertiary} style={styles.signChevron} />
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Rising Sign */}
            <TouchableOpacity 
              style={[styles.signItem, styles.lastSignItem]} 
              onPress={() => openSignSelector('rising')}
            >
              <View style={[styles.signIconContainer, { backgroundColor: `${currentDayTheme.colors.primary}15` }]}>
                <Star size={16} color={currentDayTheme.colors.primary} />
              </View>
              <View style={styles.signDetails}>
                <Text style={[styles.signLabel, { color: colors.textSecondary }]}>Rising Sign</Text>
                <View style={styles.signValueContainer}>
                  <Text style={[styles.signValue, { color: colors.text }]}>
                    {getZodiacSignById(risingSign).name}
                  </Text>
                  <Text style={styles.signSymbol}>{getZodiacSignById(risingSign).symbol}</Text>
                  <ChevronDown size={14} color={colors.textTertiary} style={styles.signChevron} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Stats Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statBadgeContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
                <Text style={[styles.statValue, { color: currentDayTheme.colors.primary }]}>
                  {ritualLogs?.length || 0}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rituals
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statBadgeContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
                <Text style={[styles.statValue, { color: currentDayTheme.colors.primary }]}>
                  {profile?.level || 1}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Level
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statBadgeContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
                <Star size={16} color={currentDayTheme.colors.primary} />
                <Text style={[styles.statValue, { color: currentDayTheme.colors.primary, marginLeft: 4 }]}>
                  {profile?.experience || 0}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                XP
              </Text>
            </View>
          </View>
        </Card>
        
        {/* Location Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.locationCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
              <MapPin size={18} color={currentDayTheme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Location
            </Text>
            <TouchableOpacity 
              style={[styles.locationEditButton, { backgroundColor: `${currentDayTheme.colors.primary}10` }]}
              onPress={handleLocationUpdate}
            >
              <Edit2 size={16} color={currentDayTheme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.locationDetails}>
            <Text style={[styles.locationText, { color: colors.text }]}>
              {getLocationDisplay()}
            </Text>
            
            <Text style={[styles.locationNote, { color: colors.textTertiary }]}>
              Used for planetary hour calculations
            </Text>
          </View>
        </Card>
        
        {/* Achievements Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.achievementsCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
              <Award size={18} color={currentDayTheme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Achievements
            </Text>
          </View>
          
          <View style={styles.achievementsList}>
            {/* First Ritual Achievement */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIconContainer, { 
                backgroundColor: achievementData.hasCompletedRitual ? `${currentDayTheme.colors.primary}20` : `${colors.textTertiary}20` 
              }]}>
                <BookOpen size={16} color={achievementData.hasCompletedRitual ? currentDayTheme.colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementTitle, { 
                  color: achievementData.hasCompletedRitual ? colors.text : colors.textTertiary 
                }]}>
                  First Ritual
                </Text>
                <Text style={[styles.achievementDesc, { 
                  color: achievementData.hasCompletedRitual ? colors.textSecondary : colors.textTertiary 
                }]}>
                  {achievementData.hasCompletedRitual ? 'Completed your first planetary ritual' : 'Complete your first planetary ritual'}
                </Text>
              </View>
            </View>
            
            {/* Moon Child Achievement */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIconContainer, { 
                backgroundColor: achievementData.moonRituals >= 5 ? `${currentDayTheme.colors.primary}20` : `${colors.textTertiary}20` 
              }]}>
                <Moon size={16} color={achievementData.moonRituals >= 5 ? currentDayTheme.colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementTitle, { 
                  color: achievementData.moonRituals >= 5 ? colors.text : colors.textTertiary 
                }]}>
                  Moon Child
                </Text>
                <Text style={[styles.achievementDesc, { 
                  color: achievementData.moonRituals >= 5 ? colors.textSecondary : colors.textTertiary 
                }]}>
                  {achievementData.moonRituals >= 5 
                    ? 'Completed 5 Moon rituals' 
                    : `Complete 5 Moon rituals (${achievementData.moonRituals}/5)`}
                </Text>
              </View>
            </View>
            
            {/* Solar Practitioner Achievement */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIconContainer, { 
                backgroundColor: achievementData.sunRituals >= 5 ? `${currentDayTheme.colors.primary}20` : `${colors.textTertiary}20` 
              }]}>
                <Sun size={16} color={achievementData.sunRituals >= 5 ? currentDayTheme.colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementTitle, { 
                  color: achievementData.sunRituals >= 5 ? colors.text : colors.textTertiary 
                }]}>
                  Solar Practitioner
                </Text>
                <Text style={[styles.achievementDesc, { 
                  color: achievementData.sunRituals >= 5 ? colors.textSecondary : colors.textTertiary 
                }]}>
                  {achievementData.sunRituals >= 5 
                    ? 'Completed 5 Sun rituals' 
                    : `Complete 5 Sun rituals (${achievementData.sunRituals}/5)`}
                </Text>
              </View>
            </View>
            
            {/* Cosmic Voyager Achievement */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIconContainer, { 
                backgroundColor: achievementData.allPlanetsComplete ? `${currentDayTheme.colors.primary}20` : `${colors.textTertiary}20` 
              }]}>
                <Star size={16} color={achievementData.allPlanetsComplete ? currentDayTheme.colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementTitle, { 
                  color: achievementData.allPlanetsComplete ? colors.text : colors.textTertiary 
                }]}>
                  Cosmic Voyager
                </Text>
                <Text style={[styles.achievementDesc, { 
                  color: achievementData.allPlanetsComplete ? colors.textSecondary : colors.textTertiary 
                }]}>
                  {achievementData.allPlanetsComplete 
                    ? 'Practiced rituals for all 7 classical planets' 
                    : `Practice rituals for all 7 classical planets (${achievementData.uniquePlanetsCount}/7)`}
                </Text>
              </View>
            </View>
            
            {/* Dedicated Practitioner Achievement */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIconContainer, { 
                backgroundColor: (profile?.streak_days || 0) >= 7 ? `${currentDayTheme.colors.primary}20` : `${colors.textTertiary}20` 
              }]}>
                <Calendar size={16} color={(profile?.streak_days || 0) >= 7 ? currentDayTheme.colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementTitle, { 
                  color: (profile?.streak_days || 0) >= 7 ? colors.text : colors.textTertiary 
                }]}>
                  Dedicated Practitioner
                </Text>
                <Text style={[styles.achievementDesc, { 
                  color: (profile?.streak_days || 0) >= 7 ? colors.textSecondary : colors.textTertiary 
                }]}>
                  {(profile?.streak_days || 0) >= 7 
                    ? 'Maintained a 7-day ritual streak' 
                    : `Maintain a 7-day ritual streak (${profile?.streak_days || 0}/7)`}
                </Text>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Streak Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.streakCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
              <Calendar size={18} color={currentDayTheme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ritual Streaks
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile?.streak_days || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {/* This would ideally come from the profile, but we'll use streak_days as a placeholder */}
                {profile?.streak_days || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Streak</Text>
            </View>
          </View>
        </Card>
        
        {/* Recent Activity Card */}
        <Card
          variant="filled"
          color={isDark ? (colors.surface2 || colors.surface) : colors.surface}
          withGradient={!isDark}
          style={styles.recentActivityCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
              <BookOpen size={18} color={currentDayTheme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
          </View>
          
          {(ritualLogs?.length || 0) > 0 ? (
            ritualLogs?.slice(0, 3).map((ritual: any, index: number) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${currentDayTheme.colors.primary}10` }]}>
                  <PlanetSymbol planetId={ritual.planetId || 'sun'} size={16} color={currentDayTheme.colors.primary} />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {ritual.name}
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                    {formatDate(ritual.completed_at ? new Date(ritual.completed_at) : null)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                No recent activity
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
      
      {showLocationPrompt && (
        <LocationPrompt 
          visible={showLocationPrompt}
          onClose={() => setShowLocationPrompt(false)}
          onLocationSelected={handleLocationSelected}
        />
      )}
      
      {/* Sign Selector Modal */}
      <Modal
        visible={showSignSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSignSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Your {signType === 'sun' ? 'Sun' : signType === 'moon' ? 'Moon' : 'Rising'} Sign
              </Text>
              <TouchableOpacity onPress={() => setShowSignSelector(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={zodiacSigns}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.zodiacItem, { borderBottomColor: colors.border }]}
                  onPress={() => saveSignSelection(item.id)}
                >
                  <View style={[styles.zodiacIconContainer, { backgroundColor: `${currentDayTheme.colors.primary}20` }]}>
                    <Text style={[styles.zodiacSymbolLarge, { color: colors.text }]}>{item.symbol}</Text>
                  </View>
                  <View style={styles.zodiacInfo}>
                    <Text style={[styles.zodiacName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.zodiacElement, { color: colors.textSecondary }]}>
                      {item.element.charAt(0).toUpperCase() + item.element.slice(1)} Element
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.zodiacList}
            />
          </View>
        </View>
      </Modal>
      </Container>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  hero: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 8,
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
  heroOrb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Profile card styles
  profileCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    marginBottom: 8,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statsCard: {
    marginBottom: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  // Astrological signs styles
  astroSignsCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  signsList: {
    marginTop: 12,
  },
  signItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
  },
  lastSignItem: {
    borderBottomWidth: 0,
  },
  signIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signDetails: {
    flex: 1,
    marginLeft: 12,
  },
  signLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  signValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
  },
  signSymbol: {
    marginLeft: 8,
  },
  signChevron: {
    marginLeft: 'auto',
  },
  // Stats and badges styles
  statBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  // Location styles
  locationCard: {
    marginBottom: 16,
    padding: 16,
  },
  
  // Profile editing styles
  editProfileContainer: {
    padding: 16,
    width: '100%',
  },
  editFieldContainer: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  editInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Zodiac sign avatar
  zodiacSymbol: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  
  // Streak card
  streakCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  zodiacList: {
    maxHeight: 400,
  },
  zodiacItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  zodiacIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  zodiacSymbolLarge: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  zodiacInfo: {
    flex: 1,
  },
  zodiacName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  zodiacElement: {
    fontSize: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
    flex: 1,
  },
  locationEditButton: {
    padding: 4,
    borderRadius: 4,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Achievement styles
  achievementsCard: {
    marginBottom: 16,
    padding: 16,
  },
  achievementsList: {
    marginTop: 12,
  },
  achievementItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 14,
  },
  // Activity styles
  recentActivityCard: {
    marginBottom: 16,
    padding: 16,
  },
  activityItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
});