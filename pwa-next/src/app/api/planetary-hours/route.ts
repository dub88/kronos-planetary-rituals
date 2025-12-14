import { NextResponse } from 'next/server';
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import type { PlanetId } from '@/lib/astro';
import { chaldeanOrder, getPlanetaryDayRuler } from '@/lib/planetary';
import { roundCoord, TtlCache } from '@/lib/ttlCache';

type PlanetaryHourInterval = {
  index: number; // 1..24
  ruler: PlanetId;
  isDay: boolean;
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  isCurrent: boolean;
};

type PlanetaryHoursResponse = {
  date: string; // local date requested, YYYY-MM-DD
  timezone: string;
  latitude: number;
  longitude: number;
  sunriseUtc: string;
  sunsetUtc: string;
  nextSunriseUtc: string;
  dayRuler: PlanetId;
  hours: PlanetaryHourInterval[];
};

const planetaryHoursCache = new TtlCache<PlanetaryHoursResponse>();

function withCurrentFlags(payload: PlanetaryHoursResponse, nowUtc: DateTime): PlanetaryHoursResponse {
  return {
    ...payload,
    hours: payload.hours.map((h) => ({
      ...h,
      isCurrent: nowUtc >= DateTime.fromISO(h.startUtc) && nowUtc < DateTime.fromISO(h.endUtc),
    })),
  };
}

function parseNumber(value: string | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) return null;
  return n;
}

function parseDateParam(dateParam: string | null, zone: string): DateTime {
  if (!dateParam) return DateTime.now().setZone(zone).startOf('day');
  // Expect YYYY-MM-DD
  const dt = DateTime.fromISO(dateParam, { zone });
  if (dt.isValid) return dt.startOf('day');
  return DateTime.now().setZone(zone).startOf('day');
}

function getSunEvents(localDayStart: DateTime, observer: Astronomy.Observer) {
  // Use local noon as an anchor to safely find sunrise before it and sunset after it.
  const localNoon = localDayStart.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
  const noonUtc = localNoon.toUTC().toJSDate();

  // SearchRiseSet(body, observer, direction, dateStart, limitDays, metersAboveGround)
  // Use negative limitDays to search backward for sunrise of the local day.
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, noonUtc, -2, 0);
  // Search forward for sunset.
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, noonUtc, +2, 0);
  // Search forward for next sunrise.
  const nextSunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, noonUtc, +3, 0);

  if (!sunrise || !sunset || !nextSunrise) {
    throw new Error('Could not determine sunrise/sunset for the given date/location');
  }

  return {
    sunriseUtc: DateTime.fromJSDate(sunrise.date, { zone: 'utc' }),
    sunsetUtc: DateTime.fromJSDate(sunset.date, { zone: 'utc' }),
    nextSunriseUtc: DateTime.fromJSDate(nextSunrise.date, { zone: 'utc' }),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const tz = url.searchParams.get('tz') || 'UTC';
  const lat = parseNumber(url.searchParams.get('lat'));
  const lon = parseNumber(url.searchParams.get('lon'));
  const dateParam = url.searchParams.get('date');

  if (lat == null || lon == null) {
    return NextResponse.json(
      { error: 'Missing or invalid lat/lon query params' },
      { status: 400 }
    );
  }

  const localDayStart = parseDateParam(dateParam, tz);
  const dateStr = localDayStart.toFormat('yyyy-LL-dd');

  const cacheKey = JSON.stringify({
    date: dateStr,
    tz,
    lat: roundCoord(lat, 4),
    lon: roundCoord(lon, 4),
  });

  planetaryHoursCache.prune();
  const cached = planetaryHoursCache.get(cacheKey);
  const nowUtc = DateTime.utc();
  if (cached) {
    const cacheControl = (() => {
      const todayStr = DateTime.now().setZone(tz).toFormat('yyyy-LL-dd');
      if (dateStr === todayStr) {
        return 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';
      }
      return 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
    })();

    return NextResponse.json(withCurrentFlags(cached, nowUtc), {
      headers: {
        'Cache-Control': cacheControl,
      },
    });
  }

  const observer = new Astronomy.Observer(lat, lon, 0);

  let sunriseUtc: DateTime;
  let sunsetUtc: DateTime;
  let nextSunriseUtc: DateTime;

  try {
    const events = getSunEvents(localDayStart, observer);
    sunriseUtc = events.sunriseUtc;
    sunsetUtc = events.sunsetUtc;
    nextSunriseUtc = events.nextSunriseUtc;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to calculate sunrise/sunset';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  const localDayForRuler = localDayStart; // local day reference
  // Luxon weekday: 1=Mon..7=Sun. Convert to JS day index: 0=Sun..6=Sat.
  const jsDayIndex = localDayForRuler.weekday === 7 ? 0 : localDayForRuler.weekday;
  const dayRuler = getPlanetaryDayRuler(jsDayIndex);
  const startIndex = chaldeanOrder.indexOf(dayRuler);

  const dayMinutes = sunsetUtc.diff(sunriseUtc, 'minutes').minutes;
  const nightMinutes = nextSunriseUtc.diff(sunsetUtc, 'minutes').minutes;

  const dayHour = dayMinutes / 12;
  const nightHour = nightMinutes / 12;

  const hours: PlanetaryHourInterval[] = [];

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12;

    const start = isDay
      ? sunriseUtc.plus({ minutes: i * dayHour })
      : sunsetUtc.plus({ minutes: (i - 12) * nightHour });

    const end = isDay
      ? (i === 11 ? sunsetUtc : sunriseUtc.plus({ minutes: (i + 1) * dayHour }))
      : (i === 23 ? nextSunriseUtc : sunsetUtc.plus({ minutes: (i - 11) * nightHour }));

    const ruler = chaldeanOrder[(startIndex + i) % 7];

    const isCurrent = nowUtc >= start && nowUtc < end;

    hours.push({
      index: i + 1,
      ruler,
      isDay,
      startUtc: start.toUTC().toISO()!,
      endUtc: end.toUTC().toISO()!,
      startLocal: start.setZone(tz).toISO()!,
      endLocal: end.setZone(tz).toISO()!,
      isCurrent,
    });
  }

  const payload: PlanetaryHoursResponse = {
    date: dateStr,
    timezone: tz,
    latitude: lat,
    longitude: lon,
    sunriseUtc: sunriseUtc.toISO()!,
    sunsetUtc: sunsetUtc.toISO()!,
    nextSunriseUtc: nextSunriseUtc.toISO()!,
    dayRuler,
    hours,
  };

  // Cache the deterministic schedule with all isCurrent flags cleared.
  planetaryHoursCache.set(
    cacheKey,
    {
      ...payload,
      hours: payload.hours.map((h) => ({ ...h, isCurrent: false })),
    },
    24 * 60 * 60 * 1000
  );

  const cacheControl = (() => {
    const todayStr = DateTime.now().setZone(tz).toFormat('yyyy-LL-dd');
    if (dateStr === todayStr) {
      return 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';
    }
    return 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
  })();

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': cacheControl,
    },
  });
}
