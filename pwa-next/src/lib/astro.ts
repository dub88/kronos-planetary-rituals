export type PlanetId = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export const zodiacSigns = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof zodiacSigns)[number];

export function normalizeAngle360(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

// Returns delta in range (-180, 180]
export function normalizeDelta180(deg: number): number {
  const x = ((deg + 180) % 360 + 360) % 360 - 180;
  return x === -180 ? 180 : x;
}

export function longitudeToSign(longitude: number): {
  sign: ZodiacSign;
  degreeInSign: number;
} {
  const lon = normalizeAngle360(longitude);
  const signIndex = Math.floor(lon / 30) % 12;
  const degreeInSign = lon - signIndex * 30;
  return {
    sign: zodiacSigns[signIndex],
    degreeInSign,
  };
}
