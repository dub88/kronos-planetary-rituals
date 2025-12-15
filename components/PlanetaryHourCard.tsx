import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';
import { usePlanetaryStore } from '@/stores/planetaryStore';
import { useLocationStore } from '@/stores/locationStore';
import { Clock, MapPin } from 'lucide-react-native';
import { formatHourTime } from '@/utils/planetaryHours';
import { getPlanetById } from '@/constants/planets';

const PlanetaryHourCard = () => {
  const { colors, isDark } = useTheme();
  const { fetchPlanetaryHours, hours, currentHour, isLoading } = usePlanetaryStore();
  const { location } = useLocationStore();
  const [timeNow, setTimeNow] = useState(new Date());
  
  // Fetch planetary hours when component mounts or location changes
  useEffect(() => {
    try {
      if (location?.latitude && location?.longitude) {
        fetchPlanetaryHours(location.latitude, location.longitude);
      } else {
        fetchPlanetaryHours();
      }
      
      // Update time every minute
      const interval = setInterval(() => {
        setTimeNow(new Date());
      }, 60000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error in PlanetaryHourCard useEffect:', error);
    }
  }, [fetchPlanetaryHours, location]);
  
  // Get current hour's planet info with error handling
  const currentPlanet = currentHour ? getPlanetById(currentHour.planet) : null;
  
  // Get next hour with error handling
  const getNextHour = () => {
    try {
      if (!currentHour || !hours || hours.length === 0) return null;
      
      const currentIndex = hours.findIndex(h => h.isCurrentHour);
      if (currentIndex === -1 || currentIndex === hours.length - 1) return null;
      
      return hours[currentIndex + 1];
    } catch (error) {
      console.error('Error in getNextHour:', error);
      return null;
    }
  };
  
  const nextHour = getNextHour();
  const nextPlanet = nextHour ? getPlanetById(nextHour.planet) : null;
  
  // Format time remaining in current hour with error handling
  const getTimeRemaining = () => {
    try {
      if (!currentHour) return '';
      
      const endTime = new Date(currentHour.endTime);
      const diffMs = endTime.getTime() - timeNow.getTime();
      
      if (diffMs <= 0) return '0m';
      
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    } catch (error) {
      console.error('Error in getTimeRemaining:', error);
      return '0m';
    }
  };
  
  // Get border style based on the current planet with error handling
  const getBorderStyle = () => {
    try {
      if (!currentPlanet) return {};
      
      return {
        borderColor: currentPlanet.color || colors.border,
        borderWidth: 1,
      };
    } catch (error) {
      console.error('Error in getBorderStyle:', error);
      return {};
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading planetary hours...
        </Text>
      </View>
    );
  }
  
  if (!currentHour) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Could not determine current planetary hour.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => fetchPlanetaryHours(
            location?.latitude,
            location?.longitude
          )}
        >
          <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? colors.surface2 : colors.surface },
      getBorderStyle()
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Clock size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Current Planetary Hour
          </Text>
        </View>
        
        {location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {location.name || 'Current Location'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.currentHourContainer}>
          <View style={styles.planetInfo}>
            <Text style={[
              styles.planetName, 
              { color: currentPlanet?.color || colors.text }
            ]}>
              {currentPlanet?.name || 'Unknown'}
            </Text>
            <Text style={[styles.hourTime, { color: colors.textSecondary }]}>
              {formatHourTime(new Date(currentHour.startTime))} - {formatHourTime(new Date(currentHour.endTime))}
            </Text>
          </View>
          
          <View style={[
            styles.timeRemainingContainer, 
            {
              backgroundColor: isDark ? colors.surface : `${colors.primary}14`,
              borderColor: `${colors.primary}26`,
              borderWidth: 1,
            }
          ]}>
            <Text style={[styles.timeRemainingLabel, { color: colors.textSecondary }]}>
              Remaining
            </Text>
            <Text style={[styles.timeRemainingValue, { color: colors.primary }]}>
              {getTimeRemaining()}
            </Text>
          </View>
        </View>
        
        {nextHour && nextPlanet && (
          <View style={[styles.nextHourContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.nextHourLabel, { color: colors.textSecondary }]}>
              Next Hour:
            </Text>
            <View style={styles.nextHourInfo}>
              <Text style={[
                styles.nextPlanetName, 
                { color: nextPlanet.color || colors.text }
              ]}>
                {nextPlanet.name}
              </Text>
              <Text style={[styles.nextHourTime, { color: colors.textSecondary }]}>
                {formatHourTime(new Date(nextHour.startTime))}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  currentHourContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  hourTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timeRemainingContainer: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRemainingLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  timeRemainingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  nextHourContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nextHourLabel: {
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
  },
  nextHourInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPlanetName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  nextHourTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loadingText: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default PlanetaryHourCard;