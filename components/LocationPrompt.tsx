import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useLocationStore } from '@/stores/locationStore';
import { MapPin, X } from 'lucide-react-native';
import * as Location from 'expo-location';

export interface LocationPromptProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected?: (location: { latitude: number; longitude: number; name: string }) => void;
}

const LocationPrompt = ({ visible, onClose, onLocationSelected }: LocationPromptProps) => {
  const { colors } = useTheme();
  const { setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request location permissions when the component mounts
  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError('Permission to access location was denied');
          }
        } catch (err) {
          console.error('Error requesting location permissions:', err);
          setError('Could not request location permissions');
        }
      })();
    }
  }, [visible]);
  
  const handleGetLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (Platform.OS === 'web') {
        // Web implementation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const newLocation = {
                latitude,
                longitude,
                name: 'Current Location',
              };
              setLocation(newLocation);
              setLoading(false);
              if (onLocationSelected) {
                onLocationSelected(newLocation);
              }
              onClose();
            },
            (err) => {
              console.error('Error getting location on web:', err);
              setError('Could not get your location. Please try again.');
              setLoading(false);
            }
          );
        } else {
          setError('Geolocation is not supported by this browser.');
          setLoading(false);
        }
      } else {
        // Native implementation
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        // Get location name (reverse geocoding)
        try {
          const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          const locationName = geocode[0]?.city || geocode[0]?.region || 'Current Location';
          
          const newLocation = {
            latitude,
            longitude,
            name: locationName,
          };
          setLocation(newLocation);
          if (onLocationSelected) {
            onLocationSelected(newLocation);
          }
        } catch (geocodeError) {
          console.error('Error getting location name:', geocodeError);
          // Still set location even if reverse geocoding fails
          const newLocation = {
            latitude,
            longitude,
            name: 'Current Location',
          };
          setLocation(newLocation);
          if (onLocationSelected) {
            onLocationSelected(newLocation);
          }
        }
        
        setLoading(false);
        onClose();
      }
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Could not get your location. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    // Use default location (could be null or a default city)
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <MapPin size={48} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Location Access
          </Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Allow the app to access your location to calculate accurate planetary hours and astrological data for your specific location.
          </Text>
          
          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleGetLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Allow Location Access</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Skip for Now
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.privacyText, { color: colors.textTertiary }]}>
            Your location data is only used within the app and is not shared with third parties.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LocationPrompt;