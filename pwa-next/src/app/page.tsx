'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Position = {
  planet: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  isRetrograde: boolean;
};

type PositionsResponse = {
  timestampUtc: string;
  positions: Position[];
};

type PlanetaryHourInterval = {
  index: number;
  ruler: string;
  isDay: boolean;
  startLocal: string;
  endLocal: string;
  isCurrent: boolean;
};

type PlanetaryHoursResponse = {
  date: string;
  timezone: string;
  latitude: number;
  longitude: number;
  dayRuler: string;
  sunriseUtc: string;
  sunsetUtc: string;
  nextSunriseUtc: string;
  hours: PlanetaryHourInterval[];
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Home() {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );

  const defaultLat = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT);
  const defaultLon = Number(process.env.NEXT_PUBLIC_DEFAULT_LON);
  const [lat, setLat] = useState<number>(() => (Number.isFinite(defaultLat) ? defaultLat : 0));
  const [lon, setLon] = useState<number>(() => (Number.isFinite(defaultLon) ? defaultLon : 0));
  const [coordsError, setCoordsError] = useState<string | null>(null);

  const [positions, setPositions] = useState<PositionsResponse | null>(null);
  const [hours, setHours] = useState<PlanetaryHoursResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      },
      () => {
        setCoordsError('Location permission denied. Enter coordinates manually.');
      }
    );
  }, []);

  const refresh = async () => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setError('Missing coordinates');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [posRes, hrsRes] = await Promise.all([
        fetch('/api/positions'),
        fetch(
          `/api/planetary-hours?tz=${encodeURIComponent(timezone)}&lat=${encodeURIComponent(
            String(lat)
          )}&lon=${encodeURIComponent(String(lon))}`
        ),
      ]);

      const posJson = await posRes.json();
      if (!posRes.ok) throw new Error(posJson?.error || 'Failed to fetch positions');

      const hrsJson = await hrsRes.json();
      if (!hrsRes.ok) throw new Error(hrsJson?.error || 'Failed to fetch planetary hours');

      setPositions(posJson);
      setHours(hrsJson);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load data';
      setError(message);
      setPositions(null);
      setHours(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentHour = hours?.hours.find((h) => h.isCurrent) || null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kronos</h1>
        <Link className="text-sm underline" href="/calendar">
          Calendar
        </Link>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border p-4">
        <div className="text-sm text-zinc-600">Timezone: {timezone}</div>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Latitude
            <input
              className="rounded border px-2 py-1"
              value={Number.isFinite(lat) ? String(lat) : ''}
              onChange={(e) => setLat(e.target.value ? Number(e.target.value) : NaN)}
              placeholder="e.g. 40.76"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Longitude
            <input
              className="rounded border px-2 py-1"
              value={Number.isFinite(lon) ? String(lon) : ''}
              onChange={(e) => setLon(e.target.value ? Number(e.target.value) : NaN)}
              placeholder="e.g. -111.89"
            />
          </label>
          <div className="grid gap-1 text-sm">
            Actions
            <button
              className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {coordsError && <div className="text-sm text-amber-700">{coordsError}</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {hours && (
        <section className="mt-8 grid gap-3">
          <div className="text-sm text-zinc-600">
            Day ruler:{' '}
            <span className="font-medium text-zinc-900">{hours.dayRuler}</span>
          </div>

          {currentHour && (
            <div className="rounded-xl border p-4">
              <div className="text-sm text-zinc-600">Current planetary hour</div>
              <div className="mt-1 text-xl font-semibold">{currentHour.ruler}</div>
              <div className="mt-1 text-sm text-zinc-600">
                {fmtTime(currentHour.startLocal)}–{fmtTime(currentHour.endLocal)}
              </div>
            </div>
          )}
        </section>
      )}

      {positions && (
        <section className="mt-8">
          <div className="text-sm text-zinc-600">Positions (UTC): {positions.timestampUtc}</div>
          <div className="mt-3 grid gap-2">
            {positions.positions.map((p) => (
              <div
                key={p.planet}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <div className="text-sm font-medium">{p.planet}</div>
                <div className="text-sm">
                  {p.sign} {p.degreeInSign.toFixed(2)}°{p.isRetrograde ? ' ℞' : ''}
                </div>
                <div className="text-xs text-zinc-500">{p.longitude.toFixed(4)}°</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
