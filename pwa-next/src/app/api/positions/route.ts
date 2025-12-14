import { NextResponse } from 'next/server';
import * as Astronomy from 'astronomy-engine';
import { longitudeToSign, normalizeDelta180, normalizeAngle360, type PlanetId } from '@/lib/astro';
import { TtlCache } from '@/lib/ttlCache';

type PlanetPositionResponse = {
  timestampUtc: string;
  positions: Array<{
    planet: PlanetId;
    longitude: number;
    sign: string;
    degreeInSign: number;
    isRetrograde: boolean;
  }>;
};

const positionsCache = new TtlCache<PlanetPositionResponse>();

const planetBodyMap: Record<PlanetId, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

function geocentricEclipticLongitude(planet: PlanetId, body: Astronomy.Body, time: Date): number {
  if (planet === 'sun') {
    // Apparent geocentric true ecliptic coordinates of date.
    return Astronomy.SunPosition(time).elon;
  }

  if (planet === 'moon') {
    // Spherical ecliptic geocentric position of the Moon.
    return Astronomy.EclipticGeoMoon(time).lon;
  }

  // Geocentric EQJ vector -> true ecliptic of date.
  const vec = Astronomy.GeoVector(body, time, true);
  return Astronomy.Ecliptic(vec).elon;
}

function parseTimestamp(param: string | null): Date {
  if (!param) return new Date();
  const d = new Date(param);
  if (!isNaN(d.getTime())) return d;
  const ms = Number(param);
  if (!Number.isNaN(ms) && Number.isFinite(ms)) return new Date(ms);
  return new Date();
}

function isRetrograde(planet: PlanetId, body: Astronomy.Body, time: Date): boolean {
  // Use a small time delta and compare geocentric longitudes.
  // Negative delta indicates apparent retrograde motion.
  const dtMs = 60 * 60 * 1000; // 1 hour
  const lon1 = geocentricEclipticLongitude(planet, body, time);
  const lon2 = geocentricEclipticLongitude(planet, body, new Date(time.getTime() + dtMs));
  const delta = normalizeDelta180(lon2 - lon1);
  return delta < 0;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timestampParam = url.searchParams.get('timestamp');
  const time = parseTimestamp(timestampParam);

  const isNowRequest = !timestampParam;
  const cacheKey = isNowRequest ? 'now' : time.toISOString();

  positionsCache.prune();
  const cached = positionsCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': isNowRequest
          ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
          : 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }

  const planets: PlanetId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  const positions = planets.map((planet) => {
    const body = planetBodyMap[planet];
    const lon = normalizeAngle360(geocentricEclipticLongitude(planet, body, time));
    const { sign, degreeInSign } = longitudeToSign(lon);

    return {
      planet,
      longitude: lon,
      sign,
      degreeInSign,
      isRetrograde: planet === 'sun' || planet === 'moon' ? false : isRetrograde(planet, body, time),
    };
  });

  const payload: PlanetPositionResponse = {
    timestampUtc: time.toISOString(),
    positions,
  };

  // Cache "now" briefly and fixed timestamps longer.
  positionsCache.set(cacheKey, payload, isNowRequest ? 30_000 : 7 * 24 * 60 * 60 * 1000);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': isNowRequest
        ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
        : 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
