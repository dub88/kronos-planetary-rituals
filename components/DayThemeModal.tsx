import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from './ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import GothicSymbol from './GothicSymbol';

interface DayThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const DayThemeModal = ({ visible, onClose }: DayThemeModalProps) => {
  const { currentDayTheme, colors, isDark } = useTheme();
  
  // Safely get gradient colors with fallback
  const gradientColors = (() => {
    const g = currentDayTheme?.gradient;
    if (g && g.length >= 2) {
      return [g[0], g[1], ...g.slice(2)] as [string, string, ...string[]];
    }
    return ['#FFFFFF', '#EEEEEE'] as [string, string];
  })();
  
  // Safely get symbol with fallback
  const symbol = currentDayTheme?.symbol || 
                (currentDayTheme?.motifs?.symbol || '☉');
  
  // Safely get name with fallback
  const name = currentDayTheme?.name || 'the Planet';
  
  // Safely get correspondences with fallbacks
  const correspondenceColors = currentDayTheme?.correspondences?.colors || ['Gold', 'Yellow'];
  const correspondenceHerbs = currentDayTheme?.correspondences?.herbs || ['Sunflower', 'Marigold'];
  const correspondenceIncense = currentDayTheme?.correspondences?.incense || ['Frankincense', 'Cinnamon'];
  const correspondenceCrystals = currentDayTheme?.correspondences?.crystals || ['Citrine', 'Amber'];
  const correspondenceMetal = currentDayTheme?.correspondences?.metal || 'Gold';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer, 
          { 
            backgroundColor: isDark ? colors.surface : colors.background,
            borderColor: colors.border,
          }
        ]}>
          {/* Header with gradient */}
          <LinearGradient
            colors={gradientColors}
            style={styles.header}
          >
            <GothicSymbol symbol={symbol} size={40} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Day of {name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
          
          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Correspondences Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Correspondences</Text>
              
              <View style={styles.correspondenceItem}>
                <Text style={[styles.correspondenceLabel, { color: colors.textSecondary }]}>Colors:</Text>
                <Text style={[styles.correspondenceValue, { color: colors.text }]}>
                  {correspondenceColors.join(', ')}
                </Text>
              </View>
              
              <View style={styles.correspondenceItem}>
                <Text style={[styles.correspondenceLabel, { color: colors.textSecondary }]}>Herbs:</Text>
                <Text style={[styles.correspondenceValue, { color: colors.text }]}>
                  {correspondenceHerbs.join(', ')}
                </Text>
              </View>
              
              <View style={styles.correspondenceItem}>
                <Text style={[styles.correspondenceLabel, { color: colors.textSecondary }]}>Incense:</Text>
                <Text style={[styles.correspondenceValue, { color: colors.text }]}>
                  {correspondenceIncense.join(', ')}
                </Text>
              </View>
              
              <View style={styles.correspondenceItem}>
                <Text style={[styles.correspondenceLabel, { color: colors.textSecondary }]}>Crystals:</Text>
                <Text style={[styles.correspondenceValue, { color: colors.text }]}>
                  {correspondenceCrystals.join(', ')}
                </Text>
              </View>
              
              <View style={styles.correspondenceItem}>
                <Text style={[styles.correspondenceLabel, { color: colors.textSecondary }]}>Metal:</Text>
                <Text style={[styles.correspondenceValue, { color: colors.text }]}>
                  {correspondenceMetal}
                </Text>
              </View>
            </View>
            
            {/* Element Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Element</Text>
              <Text style={[styles.elementText, { color: colors.text }]}>
                {currentDayTheme?.motifs?.element || 'Fire'}
              </Text>
            </View>
            
            {/* Pattern Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pattern</Text>
              <Text style={[styles.patternText, { color: colors.text }]}>
                {currentDayTheme?.motifs?.pattern || 'Radial'}
              </Text>
            </View>
          </ScrollView>
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
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'System',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  correspondenceItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  correspondenceLabel: {
    width: 80,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  correspondenceValue: {
    flex: 1,
    fontFamily: 'System',
  },
  elementText: {
    fontSize: 16,
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  patternText: {
    fontSize: 16,
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
});

export default DayThemeModal;