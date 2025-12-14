import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { PlanetaryPosition } from '@/types';
import { getZodiacSymbol, getDignityDescription } from '@/constants/dignities';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import { getPlanetById } from '@/constants/planets';

interface PlanetaryDignityModalProps {
  visible: boolean;
  onClose: () => void;
  planetPosition: PlanetaryPosition;
  dignity: string | null;
}

const PlanetaryDignityModal: React.FC<PlanetaryDignityModalProps> = ({
  visible,
  onClose,
  planetPosition,
  dignity,
}) => {
  const { colors } = useTheme();
  
  if (!planetPosition) return null;
  
  const planet = getPlanetById(planetPosition.planet);
  const zodiacSymbol = getZodiacSymbol(planetPosition.sign);
  
  // Get color based on dignity
  const getDignityColor = (dignityType: string | null): string => {
    if (!dignityType) return '#9E9E9E'; // Grey for null
    
    switch (dignityType) {
      case 'Domicile':
        return '#4CAF50'; // Green
      case 'Exaltation':
        return '#2196F3'; // Blue
      case 'Detriment':
        return '#FF9800'; // Orange
      case 'Fall':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey for peregrine
    }
  };
  
  const dignityColor = getDignityColor(dignity);
  const dignityDescription = dignity ? getDignityDescription(dignity) : 'No specific dignity in this sign.';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: 'System' }]}>
              Planetary Dignity
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.planetInfo}>
              <View style={styles.planetSymbolContainer}>
                <PlanetSymbol
                  planetId={planetPosition.planet}
                  size={48}
                  color={planet.color}
                  variant="glowing"
                />
              </View>
              
              <View style={styles.planetDetails}>
                <Text style={[styles.planetName, { color: colors.text, fontFamily: 'System' }]}>
                  {planet.name}
                </Text>
                <View style={styles.positionRow}>
                  <Text style={[styles.positionLabel, { color: colors.textSecondary, fontFamily: 'System' }]}>
                    Position:
                  </Text>
                  <Text style={[styles.positionValue, { color: colors.text, fontFamily: 'System' }]}>
                    {zodiacSymbol} {planetPosition.sign} {planetPosition.degree.toFixed(1)}°
                  </Text>
                </View>
                {planetPosition.isRetrograde && (
                  <Text style={[styles.retrograde, { color: colors.error, fontFamily: 'System' }]}>
                    Retrograde ℞
                  </Text>
                )}
              </View>
            </View>
            
            <View style={[styles.dignitySection, { borderColor: dignityColor }]}>
              <View style={[styles.dignityHeader, { backgroundColor: dignityColor }]}>
                <Text style={[styles.dignityTitle, { fontFamily: 'System' }]}>
                  {dignity ? dignity.toUpperCase() : 'PEREGRINE'}
                </Text>
              </View>
              
              <Text style={[styles.dignityDescription, { color: colors.text, fontFamily: 'System' }]}>
                {dignityDescription}
              </Text>
            </View>
            
            <View style={styles.effectsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'System' }]}>
                Effects on Rituals
              </Text>
              
              <Text style={[styles.effectsText, { color: colors.text, fontFamily: 'System' }]}>
                {getDignityEffects(dignity)}
              </Text>
            </View>
            
            <View style={styles.adviceSection}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'System' }]}>
                Ritual Advice
              </Text>
              
              <Text style={[styles.adviceText, { color: colors.text, fontFamily: 'System' }]}>
                {getDignityAdvice(dignity, planetPosition.planet)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Helper function to get effects based on dignity
const getDignityEffects = (dignity: string | null): string => {
  if (!dignity) return 'When a planet is peregrine (without essential dignity), rituals will have a neutral effect, neither enhanced nor diminished.';
  
  switch (dignity) {
    case 'Domicile':
      return 'Rituals performed when a planet is in rulership are significantly enhanced. The planet\'s energy flows naturally and powerfully, making this an ideal time for major workings.';
    case 'Exaltation':
      return 'When a planet is exalted, rituals receive a strong boost. The planet\'s energy is elevated and refined, making this excellent for spiritual and transformative work.';
    case 'Detriment':
      return 'Rituals performed when a planet is in detriment may face challenges. The energy is less cooperative and may require more focus and preparation to achieve desired results.';
    case 'Fall':
      return 'When a planet is in fall, its energy is at its weakest. Rituals may require additional support, such as corresponding stones or herbs, to compensate for the diminished planetary influence.';
    default:
      return 'When a planet is peregrine (without essential dignity), rituals will have a neutral effect, neither enhanced nor diminished.';
  }
};

// Helper function to get advice based on dignity and planet
const getDignityAdvice = (dignity: string | null, planetId: string): string => {
  let baseAdvice = '';
  
  if (!dignity || dignity === 'Peregrine') {
    baseAdvice = 'Focus on the basics of the ritual without expecting extraordinary results. Use supporting correspondences to strengthen the working.';
  } else if (dignity === 'Domicile' || dignity === 'Exaltation') {
    baseAdvice = 'This is an excellent time for rituals involving this planet. Take advantage of the enhanced energy by setting ambitious intentions.';
  } else {
    baseAdvice = 'Consider postponing major rituals if possible. If you must proceed, add extra protective measures and be thorough in your preparations.';
  }
  
  // Add planet-specific advice
  switch (planetId) {
    case 'sun':
      return `${baseAdvice} For Sun rituals, focus on vitality, leadership, and personal power.`;
    case 'moon':
      return `${baseAdvice} For Moon rituals, work with intuition, emotions, and subconscious patterns.`;
    case 'mercury':
      return `${baseAdvice} For Mercury rituals, emphasize communication, learning, and mental clarity.`;
    case 'venus':
      return `${baseAdvice} For Venus rituals, concentrate on love, harmony, beauty, and relationships.`;
    case 'mars':
      return `${baseAdvice} For Mars rituals, channel energy toward courage, strength, and protection.`;
    case 'jupiter':
      return `${baseAdvice} For Jupiter rituals, focus on expansion, abundance, and spiritual growth.`;
    case 'saturn':
      return `${baseAdvice} For Saturn rituals, work with discipline, boundaries, and long-term structures.`;
    default:
      return baseAdvice;
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    padding: 16,
  },
  planetInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  planetSymbolContainer: {
    marginRight: 16,
  },
  planetDetails: {
    flex: 1,
  },
  planetName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  retrograde: {
    fontSize: 16,
    fontWeight: '500',
  },
  dignitySection: {
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dignityHeader: {
    padding: 12,
    alignItems: 'center',
  },
  dignityTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dignityDescription: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  effectsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  effectsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  adviceSection: {
    marginBottom: 20,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default PlanetaryDignityModal;