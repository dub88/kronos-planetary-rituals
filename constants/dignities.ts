// Planetary dignities in astrology
// These define the relationship between planets and zodiac signs

import type { PlanetDay } from '@/types';

export interface Dignity {
  name: string;
  description: string;
  effect: string;
  color: string;
}

export const dignities: Record<string, Dignity> = {
  rulership: {
    name: 'Rulership (Domicile)',
    description: 'A planet in the sign it rules',
    effect: 'The planet is at its strongest and most comfortable',
    color: '#4CAF50' // Green
  },
  exaltation: {
    name: 'Exaltation',
    description: 'A planet in the sign of its exaltation',
    effect: 'The planet is elevated and empowered',
    color: '#2196F3' // Blue
  },
  detriment: {
    name: 'Detriment',
    description: 'A planet in the sign opposite to its rulership',
    effect: 'The planet is uncomfortable and challenged',
    color: '#FF9800' // Orange
  },
  fall: {
    name: 'Fall',
    description: 'A planet in the sign opposite to its exaltation',
    effect: 'The planet is weakened and diminished',
    color: '#F44336' // Red
  },
  peregrine: {
    name: 'Peregrine',
    description: 'A planet in a sign where it has no essential dignity',
    effect: 'The planet is neutral, neither strengthened nor weakened',
    color: '#9E9E9E' // Gray
  }
};

// Zodiac signs and their symbols
export const zodiacSigns = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' }
];

// Get zodiac symbol by sign name
export const getZodiacSymbol = (signName: string): string => {
  const sign = zodiacSigns.find(s => s.name.toLowerCase() === signName.toLowerCase());
  return sign ? sign.symbol : '';
};

// Planetary dignities chart
// Which planet rules which sign
type PlanetDignityChartEntry = {
  rulership: string[];
  exaltation: string[];
  detriment: string[];
  fall: string[];
};

export const dignityChart: Record<PlanetDay, PlanetDignityChartEntry> = {
  sun: {
    rulership: ['Leo'],
    exaltation: ['Aries'],
    detriment: ['Aquarius'],
    fall: ['Libra']
  },
  moon: {
    rulership: ['Cancer'],
    exaltation: ['Taurus'],
    detriment: ['Capricorn'],
    fall: ['Scorpio']
  },
  mercury: {
    rulership: ['Gemini', 'Virgo'],
    exaltation: ['Virgo'], // Added Virgo as exaltation for Mercury
    detriment: ['Sagittarius', 'Pisces'],
    fall: ['Pisces'] // Added Pisces as fall for Mercury
  },
  venus: {
    rulership: ['Taurus', 'Libra'],
    exaltation: ['Pisces'],
    detriment: ['Scorpio', 'Aries'],
    fall: ['Virgo']
  },
  mars: {
    rulership: ['Aries', 'Scorpio'],
    exaltation: ['Capricorn'],
    detriment: ['Libra', 'Taurus'],
    fall: ['Cancer']
  },
  jupiter: {
    rulership: ['Sagittarius', 'Pisces'],
    exaltation: ['Cancer'],
    detriment: ['Gemini', 'Virgo'],
    fall: ['Capricorn']
  },
  saturn: {
    rulership: ['Capricorn', 'Aquarius'],
    exaltation: ['Libra'],
    detriment: ['Cancer', 'Leo'],
    fall: ['Aries']
  }
};

// Get the dignity of a planet in a sign
export const getDignity = (planet: string, sign: string): string => {
  const p = planet?.toLowerCase() as PlanetDay;
  if (!p || !sign || !dignityChart[p]) {
    return 'peregrine';
  }
  
  const lowerSign = sign.toLowerCase();
  
  if (dignityChart[p].rulership.some((s: string) => s.toLowerCase() === lowerSign)) {
    return 'rulership';
  }
  
  if (dignityChart[p].exaltation.some((s: string) => s.toLowerCase() === lowerSign)) {
    return 'exaltation';
  }
  
  if (dignityChart[p].detriment.some((s: string) => s.toLowerCase() === lowerSign)) {
    return 'detriment';
  }
  
  if (dignityChart[p].fall.some((s: string) => s.toLowerCase() === lowerSign)) {
    return 'fall';
  }
  
  return 'peregrine';
};

// Get description for a dignity type
export const getDignityDescription = (dignityType: string): string => {
  const type = dignityType.toLowerCase();
  if (dignities[type]) {
    return dignities[type].description;
  }
  return 'A planet with no specific dignity in this sign.';
};