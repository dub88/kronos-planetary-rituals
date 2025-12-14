import type { PlanetId } from './astro';

export const chaldeanOrder: PlanetId[] = [
  'saturn',
  'jupiter',
  'mars',
  'sun',
  'venus',
  'mercury',
  'moon',
];

// JS Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
export function getPlanetaryDayRuler(dayOfWeek: number): PlanetId {
  const rulers: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  return rulers[((dayOfWeek % 7) + 7) % 7];
}
