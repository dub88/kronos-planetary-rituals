import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Camera, ArrowRight, Moon, Star, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import type { PlanetDay } from '@/types';
import { colors as paletteColors } from '@/constants/colors';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { pickImage, uploadAvatar, deleteAvatar } from '@/services/storage';
import GothicTitle from '@/components/GothicTitle';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { updateProfile, isLoading } = useProfileStore();
  
  const [name, setName] = useState(user?.email?.split('@')[0] || 'Seeker');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDay>('sun');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const planets: Array<{ id: PlanetDay; name: string; symbol: string }> = [
    { id: 'sun', name: 'Sun', symbol: '☉' },
    { id: 'moon', name: 'Moon', symbol: '☽' },
    { id: 'mars', name: 'Mars', symbol: '♂' },
    { id: 'mercury', name: 'Mercury', symbol: '☿' },
    { id: 'jupiter', name: 'Jupiter', symbol: '♃' },
    { id: 'venus', name: 'Venus', symbol: '♀' },
    { id: 'saturn', name: 'Saturn', symbol: '♄' },
  ];
  
  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        avatar_url: avatarUri,
        bio: `Seeker of ${planets.find(p => p.id === selectedPlanet)?.name || 'Cosmic'} wisdom`,
        level: 1,
        experience: 0,
        streak_days: 0
      });
      
      // Navigate to the main app
      router.replace('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    }
  };
  
  const handleChangeAvatar = async () => {
    try {
      const image = await pickImage();
      if (!image) return;

      setIsUploadingAvatar(true);
      const avatarUrl = await uploadAvatar(user!.id, image.base64!);
      setAvatarUri(avatarUrl);
    } catch (error: any) {
      console.error('Error changing avatar:', error);
      Alert.alert('Error', error.message || 'Failed to update avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <LinearGradient
        colors={(isDark
          ? [paletteColors.bloodRed, paletteColors.abyssal, colors.background]
          : [paletteColors.bloodRed, colors.background, colors.background]) as [string, string, ...string[]]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <GothicTitle 
            title="Complete Your Profile"
            subtitle="Tell us about yourself"
            variant="ritual"
          />
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <ProfileAvatar size={120} />
              <TouchableOpacity 
                style={[styles.changeAvatarButton, { backgroundColor: paletteColors.bloodRed, borderColor: colors.background }]}
                onPress={handleChangeAvatar}
              >
                <Camera size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
              Tap the camera icon to add a profile picture
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.text }]}>Your Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: `${colors.text}10`, borderColor: `${colors.text}20` }]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <Text style={[styles.label, { color: colors.text }]}>Your Ruling Planet</Text>
            <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
              Select the planetary energy that resonates with your spiritual path. This will guide your initial rituals and practices.
            </Text>
            
            <View style={styles.planetGrid}>
              {planets.map(planet => (
                <TouchableOpacity
                  key={planet.id}
                  style={[
                    styles.planetItem,
                    { 
                      backgroundColor: selectedPlanet === planet.id ? `${colors[planet.id]}30` : `${colors.text}10`,
                      borderColor: selectedPlanet === planet.id ? colors[planet.id] : `${colors.text}20`
                    }
                  ]}
                  onPress={() => setSelectedPlanet(planet.id)}
                >
                  <Text style={[styles.planetSymbol, { color: colors[planet.id] }]}>{planet.symbol}</Text>
                  <Text style={[styles.planetName, { color: colors.text }]}>{planet.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: paletteColors.bloodRed, borderColor: `${colors.text}20` }]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Text style={[styles.completeButtonText, { color: colors.text }]}>Begin Your Mystical Journey</Text>
                <ArrowRight size={20} color={colors.text} />
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Star size={16} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              "As above, so below. As within, so without."
            </Text>
            <Moon size={16} color={colors.textSecondary} />
          </View>
        </ScrollView>
        
        {/* Decorative runes */}
        <View style={styles.runeContainer}>
          <Text style={[styles.rune, { color: colors.text }]}>᛭</Text>
          <Text style={[styles.rune, { color: colors.text }]}>᛫</Text>
          <Text style={[styles.rune, { color: colors.text }]}>᛬</Text>
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.cornerTL, { borderColor: `${colors.text}20` }]} />
        <View style={[styles.cornerTR, { borderColor: `${colors.text}20` }]} />
        <View style={[styles.cornerBL, { borderColor: `${colors.text}20` }]} />
        <View style={[styles.cornerBR, { borderColor: `${colors.text}20` }]} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(93, 30, 51, 0.2)',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  deleteAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 12,
    fontFamily: 'serif',
  },
  planetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planetItem: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  planetSymbol: {
    fontSize: 32,
    marginBottom: 8,
  },
  planetName: {
    fontSize: 14,
    fontFamily: 'serif',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    borderWidth: 1,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: 'serif',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  runeContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    opacity: 0.3,
  },
  rune: {
    fontSize: 16,
    marginLeft: 4,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});