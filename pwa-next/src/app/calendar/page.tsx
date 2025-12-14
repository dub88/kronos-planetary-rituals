'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
  hours: PlanetaryHourInterval[];
};

function formatLocal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CalendarPage() {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );

  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [data, setData] = useState<PlanetaryHoursResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      },
      () => {
        setError('Location permission denied. Enter coordinates manually.');
      }
    );
  }, []);

  const fetchHours = async () => {
    if (lat == null || lon == null) {
      setError('Missing coordinates');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/planetary-hours?date=${encodeURIComponent(date)}&tz=${encodeURIComponent(
          timezone
        )}&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load planetary hours');
      }
      setData(json);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load planetary hours';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat != null && lon != null) {
      fetchHours();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, date]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planetary Hours</h1>
        <Link className="text-sm underline" href="/">
          Today
        </Link>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Date
            <input
              className="rounded border px-2 py-1"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Latitude
            <input
              className="rounded border px-2 py-1"
              value={lat ?? ''}
              onChange={(e) => setLat(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 40.76"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Longitude
            <input
              className="rounded border px-2 py-1"
              value={lon ?? ''}
              onChange={(e) => setLon(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. -111.89"
            />
          </label>
        </div>

        <div className="text-sm text-zinc-600">Timezone: {timezone}</div>

        <div className="flex gap-2">
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={fetchHours}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {data && (
        <section className="mt-8">
          <div className="text-sm text-zinc-600">
            Day ruler: <span className="font-medium text-zinc-900">{data.dayRuler}</span>
          </div>

          <div className="mt-4 grid gap-2">
            {data.hours.map((h) => (
              <div
                key={h.index}
                className={
                  'flex items-center justify-between rounded border px-3 py-2 ' +
                  (h.isCurrent ? 'border-black bg-zinc-50' : 'border-zinc-200')
                }
              >
                <div className="text-sm">
                  <span className="font-medium">#{h.index}</span> {h.isDay ? 'Day' : 'Night'}
                </div>
                <div className="text-sm font-medium">{h.ruler}</div>
                <div className="text-sm text-zinc-600">
                  {formatLocal(h.startLocal)}–{formatLocal(h.endLocal)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
