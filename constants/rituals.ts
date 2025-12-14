import { RitualDefinition } from '@/types';

export const ritualData: RitualDefinition[] = [
  {
    id: 'sun',
    name: 'Solar Ritual',
    description: 'A ritual to harness the power of the Sun for vitality and confidence.',
    planet: 'Sun',
    duration: 20,
    bestTime: 'Sunrise or Solar Noon',
    materials: ['Yellow candle', 'Frankincense', 'Gold or yellow crystals'],
    steps: [
      'Find a quiet space with natural sunlight',
      'Light the yellow candle',
      'Burn frankincense',
      'Meditate on solar energy for strength and vitality',
      'Express gratitude to the Sun'
    ]
  },
  {
    id: 'moon',
    name: 'Lunar Ritual',
    description: 'Connect with lunar energy for intuition and emotional healing.',
    planet: 'Moon',
    duration: 30,
    bestTime: 'Full Moon or New Moon',
    materials: ['White or silver candle', 'Moonstone', 'Bowl of water'],
    steps: [
      'Create a sacred space under moonlight',
      'Light the white/silver candle',
      'Place moonstone near the water bowl',
      'Meditate on lunar energy for intuition',
      'Write down insights received'
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury Ritual',
    description: 'Enhance communication and mental clarity.',
    planet: 'Mercury',
    duration: 15,
    bestTime: 'Wednesday morning',
    materials: ['Purple or yellow candle', 'Clear quartz', 'Journal'],
    steps: [
      'Clear your workspace',
      'Light the candle',
      'Hold the clear quartz',
      'Practice mindful breathing',
      'Write your intentions'
    ]
  }
];
