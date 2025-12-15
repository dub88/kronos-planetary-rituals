import { colors } from './colors';
import { Planet, PlanetDay, PlanetId } from '../types';

// Ensure the planets array is properly initialized
export const planets: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    day: 'Sunday',
    color: colors.sun || '#FFB900',
    candle: 'Yellow',
    symbol: '☉',
    description: 'The Sun represents vitality, willpower, and the conscious self. It governs success, leadership, and personal power.',
    ritual: 'Light a yellow candle, recite the Orphic Hymn to Sol, and focus on goals related to success, vitality, and personal power.',
  },
  {
    id: 'moon',
    name: 'Moon',
    day: 'Monday',
    color: colors.moon || '#C0C0C0',
    candle: 'White', // White candle for Moon
    symbol: '☽',
    description: 'The Moon governs intuition, emotions, and the subconscious mind. It influences dreams, psychic abilities, and emotional healing.',
    ritual: 'Light a white candle, recite the Orphic Hymn to Selene, and focus on intuition, dreams, and emotional balance.',
  },
  {
    id: 'mars',
    name: 'Mars',
    day: 'Tuesday',
    color: colors.mars || '#FF0000',
    candle: 'Red',
    symbol: '♂',
    description: 'Mars represents courage, passion, and assertiveness. It governs strength, protection, and overcoming challenges.',
    ritual: 'Light a red candle, recite the Orphic Hymn to Aries, and focus on courage, strength, and overcoming obstacles.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    day: 'Wednesday',
    color: colors.mercury || '#FF8C00', // Distinct orange color for Mercury
    candle: 'Orange', // Orange candle for Mercury
    symbol: '☿',
    description: 'Mercury governs communication, intellect, and travel. It influences learning, writing, and all forms of exchange.',
    ritual: 'Light an orange candle, recite the Orphic Hymn to Hermes, and focus on communication, learning, and mental clarity.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    day: 'Thursday',
    color: colors.jupiter || '#4B0082',
    candle: 'Blue or Purple',
    symbol: '♃',
    description: 'Jupiter represents expansion, abundance, and wisdom. It governs prosperity, growth, and spiritual development.',
    ritual: 'Light a blue or purple candle, recite the Orphic Hymn to Zeus, and focus on abundance, growth, and wisdom.',
  },
  {
    id: 'venus',
    name: 'Venus',
    day: 'Friday',
    color: colors.venus || '#00FF00',
    candle: 'Green or Pink',
    symbol: '♀',
    description: 'Venus governs love, beauty, and harmony. It influences relationships, art, and pleasure.',
    ritual: 'Light a green or pink candle, recite the Orphic Hymn to Aphrodite, and focus on love, beauty, and harmony.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    day: 'Saturday',
    color: colors.saturn || '#000000',
    candle: 'Black',
    symbol: '♄',
    description: 'Saturn represents discipline, responsibility, and time. It governs structure, limitations, and karmic lessons.',
    ritual: 'Light a black candle, recite the Orphic Hymn to Kronos, and focus on discipline, structure, and overcoming limitations.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    day: '',
    color: (colors as unknown as Record<string, string>).uranus || '#26C6DA',
    candle: '',
    symbol: '♅',
    description: 'Uranus represents change, awakening, and liberation. It governs innovation, disruption, and sudden insight.',
    ritual: '',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    day: '',
    color: (colors as unknown as Record<string, string>).neptune || '#42A5F5',
    candle: '',
    symbol: '♆',
    description: 'Neptune represents dreams, intuition, and transcendence. It governs imagination, spirituality, and dissolution of boundaries.',
    ritual: '',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    day: '',
    color: (colors as unknown as Record<string, string>).pluto || '#8D6E63',
    candle: '',
    symbol: '♇',
    description: 'Pluto represents transformation, power, and rebirth. It governs deep change, shadow work, and regeneration.',
    ritual: '',
  },
];

// Ensure we have a valid planets array
if (!planets || planets.length === 0) {
  console.error('Planets array is empty or undefined. Creating default planets.');
  // This should never happen, but just in case
}

export const getPlanetByDay = (dayOfWeek: number): Planet => {
  try {
    // Convert JavaScript day (0-6, starting with Sunday) to planet
    const planetOrder: PlanetDay[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const planetId = planetOrder[dayOfWeek % 7]; // Ensure valid index with modulo
    return getPlanetById(planetId);
  } catch (error) {
    console.error('Error in getPlanetByDay:', error);
    // Return a default Sun planet as fallback
    return {
      id: 'sun',
      name: 'Sun',
      day: 'Sunday',
      color: '#FFB900',
      candle: 'Yellow',
      symbol: '☉',
      description: 'The Sun represents vitality, willpower, and the conscious self.',
      ritual: 'Light a yellow candle and focus on goals related to success.'
    };
  }
};

// Function to get planet by ID
export const getPlanetById = (id: PlanetId): Planet => {
  try {
    // Find the planet by ID, with fallback to Sun if not found
    const planet = planets.find(planet => planet.id === id);
    if (!planet) {
      console.warn(`Planet with ID "${id}" not found, falling back to Sun`);
      // Return a default Sun planet as fallback
      return {
        id: 'sun',
        name: 'Sun',
        day: 'Sunday',
        color: '#FFB900',
        candle: 'Yellow',
        symbol: '☉',
        description: 'The Sun represents vitality, willpower, and the conscious self.',
        ritual: 'Light a yellow candle and focus on goals related to success.'
      };
    }
    return planet;
  } catch (error) {
    console.error('Error in getPlanetById:', error);
    // Return a default Sun planet as fallback
    return {
      id: 'sun',
      name: 'Sun',
      day: 'Sunday',
      color: '#FFB900',
      candle: 'Yellow',
      symbol: '☉',
      description: 'The Sun represents vitality, willpower, and the conscious self.',
      ritual: 'Light a yellow candle and focus on goals related to success.'
    };
  }
};

// Chaldean order of planets for planetary hours
export const chaldeanOrder: PlanetDay[] = [
  'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'
];

// Map days of the week to planet IDs
export const planetDayMap: Record<string, PlanetDay> = {
  'Sunday': 'sun',
  'Monday': 'moon',
  'Tuesday': 'mars',
  'Wednesday': 'mercury',
  'Thursday': 'jupiter',
  'Friday': 'venus',
  'Saturday': 'saturn'
};

// Export a default object with all planetary constants
const PlanetaryConstants = {
  planets,
  chaldeanOrder,
  planetDayMap,
  getPlanetById,
  getPlanetByDay
};

export default PlanetaryConstants;