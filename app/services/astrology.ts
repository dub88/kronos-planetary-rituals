import { PlanetaryPosition, PlanetId } from '@/types';
import * as AstronomyNS from 'astronomy-engine';

const Astronomy: typeof AstronomyNS = (AstronomyNS as unknown as { default?: typeof AstronomyNS }).default ?? AstronomyNS;

// Define the PlanetaryDignity interface
export interface PlanetaryDignity {
  status: 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
  description: string;
}

type PlanetaryPositionsOptions = {
  date?: Date;
  latitude?: number;
  longitude?: number;
};

const ZODIAC_SIGNS = [
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

const normalizeAngle360 = (deg: number): number => {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
};

const normalizeAngle180 = (deg: number): number => {
  const x = normalizeAngle360(deg);
  return x > 180 ? x - 360 : x;
};

const julianCenturiesSinceJ2000 = (date: Date): number => {
  const jd = Astronomy.MakeTime(date).tt;
  return (jd - 2451545.0) / 36525.0;
};

const meanObliquityDeg = (date: Date): number => {
  const T = julianCenturiesSinceJ2000(date);
  return 23.439291 - 0.0130042 * T;
};

const calcAscendantEclipticLonDeg = (date: Date, latitude: number, longitude: number): number => {
  const eps = (meanObliquityDeg(date) * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;

  const time = Astronomy.MakeTime(date);

  // Astronomy Engine defines longitude as degrees east of Greenwich.
  const gastHours = Astronomy.SiderealTime(time);
  const lstDeg = normalizeAngle360(gastHours * 15 + longitude);
  const theta = (lstDeg * Math.PI) / 180;

  const y = Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  const x = Math.cos(theta);
  const lambda = Math.atan2(y, x);

  return normalizeAngle360((lambda * 180) / Math.PI);
};

const signIndexFromEclipticLon = (lonDeg: number): number => Math.floor(normalizeAngle360(lonDeg) / 30);

const formatFromEclipticLon = (lonDeg: number): { sign: string; degree: number } => {
  const lon = normalizeAngle360(lonDeg);
  const signIndex = signIndexFromEclipticLon(lon);
  const degree = lon - signIndex * 30;
  return { sign: ZODIAC_SIGNS[signIndex] || 'Unknown', degree };
};

const planetBodyMap: Record<PlanetId, AstronomyNS.Body | 'moon'> = {
  sun: Astronomy.Body.Sun,
  moon: 'moon',
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

const calcGeocentricEclipticLonDeg = (planet: PlanetId, date: Date): number => {
  const time = Astronomy.MakeTime(date);
  if (planet === 'sun') {
    return normalizeAngle360(Astronomy.SunPosition(time).elon);
  }

  if (planet === 'moon') {
    const vec = Astronomy.GeoMoon(time);
    return normalizeAngle360(Astronomy.Ecliptic(vec).elon);
  }

  const body = planetBodyMap[planet];
  if (typeof body === 'string') {
    return 0;
  }

  const vec = Astronomy.GeoVector(body, time, true);
  return normalizeAngle360(Astronomy.Ecliptic(vec).elon);
};

const isRetrograde = (planet: PlanetId, date: Date): boolean => {
  // Compare apparent ecliptic longitude with a prior time slice.
  const prev = new Date(date.getTime() - 6 * 60 * 60 * 1000);
  const lonNow = calcGeocentricEclipticLonDeg(planet, date);
  const lonPrev = calcGeocentricEclipticLonDeg(planet, prev);
  const delta = normalizeAngle180(lonNow - lonPrev);
  return delta < 0;
};

/**
 * Calculates current planetary positions locally (tropical zodiac).
 */
export const getCurrentPlanetaryPositions = async (
  options: PlanetaryPositionsOptions = {}
): Promise<PlanetaryPosition[]> => {
  const date = options.date ?? new Date();
  const latitude = options.latitude;
  const longitude = options.longitude;

  const planets: PlanetId[] = [
    'saturn',
    'jupiter',
    'mars',
    'sun',
    'venus',
    'mercury',
    'moon',
    'uranus',
    'neptune',
    'pluto',
  ];

  let ascSignIndex: number | null = null;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    const ascLon = calcAscendantEclipticLonDeg(date, latitude, longitude);
    ascSignIndex = signIndexFromEclipticLon(ascLon);
  }

  const results: PlanetaryPosition[] = planets.map((planet) => {
    const lon = calcGeocentricEclipticLonDeg(planet, date);
    const { sign, degree } = formatFromEclipticLon(lon);

    const planetSignIndex = signIndexFromEclipticLon(lon);
    const house = ascSignIndex === null ? undefined : ((planetSignIndex - ascSignIndex + 12) % 12) + 1;

    return {
      planet,
      sign,
      degree,
      isRetrograde: isRetrograde(planet, date),
      house,
    };
  });

  return results;
};

/**
 * Determines the dignity of a planet based on its current sign
 */
export const getPlanetaryDignity = (planetId: string, sign: string): PlanetaryDignity => {
  // Define the dignities for each planet
  const dignities = {
    sun: {
      domicile: ['Leo'],
      exaltation: ['Aries'],
      detriment: ['Aquarius'],
      fall: ['Libra']
    },
    moon: {
      domicile: ['Cancer'],
      exaltation: ['Taurus'],
      detriment: ['Capricorn'],
      fall: ['Scorpio']
    },
    mars: {
      domicile: ['Aries', 'Scorpio'],
      exaltation: ['Capricorn'],
      detriment: ['Libra', 'Taurus'],
      fall: ['Cancer']
    },
    mercury: {
      domicile: ['Gemini', 'Virgo'],
      exaltation: ['Virgo'],
      detriment: ['Sagittarius', 'Pisces'],
      fall: ['Pisces']
    },
    jupiter: {
      domicile: ['Sagittarius', 'Pisces'],
      exaltation: ['Cancer'],
      detriment: ['Gemini', 'Virgo'],
      fall: ['Capricorn']
    },
    venus: {
      domicile: ['Taurus', 'Libra'],
      exaltation: ['Pisces'],
      detriment: ['Scorpio', 'Aries'],
      fall: ['Virgo']
    },
    saturn: {
      domicile: ['Capricorn', 'Aquarius'],
      exaltation: ['Libra'],
      detriment: ['Cancer', 'Leo'],
      fall: ['Aries']
    }
  };

  // Get the dignity for the planet
  const planetDignities = dignities[planetId as keyof typeof dignities];
  
  if (!planetDignities) {
    return {
      status: 'Peregrine',
      description: `${planetId} is in ${sign}`
    };
  }

  if (planetDignities.domicile.includes(sign)) {
    return {
      status: 'Domicile',
      description: `${planetId} is in its own sign of ${sign}`
    };
  }

  if (planetDignities.exaltation.includes(sign)) {
    return {
      status: 'Exaltation',
      description: `${planetId} is exalted in ${sign}`
    };
  }

  if (planetDignities.detriment.includes(sign)) {
    return {
      status: 'Detriment',
      description: `${planetId} is in detriment in ${sign}`
    };
  }

  if (planetDignities.fall.includes(sign)) {
    return {
      status: 'Fall',
      description: `${planetId} is in fall in ${sign}`
    };
  }

  return {
    status: 'Peregrine',
    description: `${planetId} is peregrine in ${sign}`
  };
};
