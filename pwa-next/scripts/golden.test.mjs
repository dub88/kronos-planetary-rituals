import { spawn } from 'node:child_process';
import path from 'node:path';

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertClose(actual, expected, tol, message) {
  const delta = Math.abs(actual - expected);
  if (delta > tol) {
    throw new Error(`${message} (expected ${expected}, got ${actual}, |Δ|=${delta} > ${tol})`);
  }
}

function getNextBin() {
  const bin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
  // mac/linux: executable without extension.
  return bin;
}

async function waitForServerReady(proc) {
  let stdout = '';
  const readyTokens = ['Ready in', 'Local:', 'ready - started server'];

  proc.stdout.on('data', (buf) => {
    stdout += buf.toString('utf8');
  });

  proc.stderr.on('data', (buf) => {
    stdout += buf.toString('utf8');
  });

  const timeoutMs = 30_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (readyTokens.some((t) => stdout.includes(t))) {
      return;
    }
    await sleep(250);
  }

  throw new Error(`Timed out waiting for Next dev server to be ready. Output:\n${stdout}`);
}

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}: ${JSON.stringify(json)}`);
  }
  return json;
}

const GOLDEN = {
  positions: {
    timestampUtc: '2025-01-01T00:00:00.000Z',
    // Longitudes are apparent geocentric true ecliptic of date.
    expected: {
      sun: { longitude: 280.813782275972, isRetrograde: false },
      moon: { longitude: 293.91430308803325, isRetrograde: false },
      mercury: { longitude: 259.8703910793755, isRetrograde: false },
      venus: { longitude: 327.712373643942, isRetrograde: false },
      mars: { longitude: 121.91730636403625, isRetrograde: true },
      jupiter: { longitude: 73.21479306295934, isRetrograde: true },
      saturn: { longitude: 344.5224140684451, isRetrograde: false },
    },
    toleranceDeg: 1e-6,
  },
  planetaryHours: {
    date: '2025-01-01',
    tz: 'America/Denver',
    lat: 40.7608,
    lon: -111.891,
    expected: {
      sunriseUtc: '2025-01-01T14:51:47.271Z',
      sunsetUtc: '2025-01-02T00:11:08.436Z',
      nextSunriseUtc: '2025-01-02T14:51:51.824Z',
      dayRuler: 'mercury',
      hour1: {
        index: 1,
        ruler: 'mercury',
        isDay: true,
        startUtc: '2025-01-01T14:51:47.271Z',
        endUtc: '2025-01-01T15:38:24.034Z',
      },
      hour12EndUtc: '2025-01-02T00:11:08.436Z',
      hour24EndUtc: '2025-01-02T14:51:51.824Z',
    },
  },
};

async function run() {
  const nextBin = getNextBin();
  const proc = spawn(nextBin, ['dev', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' },
  });

  const kill = () => {
    if (!proc.killed) proc.kill('SIGTERM');
  };

  process.on('exit', kill);
  process.on('SIGINT', () => {
    kill();
    process.exit(1);
  });

  try {
    await waitForServerReady(proc);

    // ---- /api/positions
    const positions = await fetchJson(
      `${BASE}/api/positions?timestamp=${encodeURIComponent(GOLDEN.positions.timestampUtc)}`
    );

    assert(positions.timestampUtc === GOLDEN.positions.timestampUtc, 'positions.timestampUtc mismatch');
    assert(Array.isArray(positions.positions), 'positions.positions must be an array');

    for (const [planet, exp] of Object.entries(GOLDEN.positions.expected)) {
      const found = positions.positions.find((p) => p.planet === planet);
      assert(found, `Missing planet in positions: ${planet}`);
      assertClose(
        found.longitude,
        exp.longitude,
        GOLDEN.positions.toleranceDeg,
        `Longitude mismatch for ${planet}`
      );
      assert(found.isRetrograde === exp.isRetrograde, `Retrograde mismatch for ${planet}`);
    }

    // ---- /api/planetary-hours
    const hours = await fetchJson(
      `${BASE}/api/planetary-hours?date=${encodeURIComponent(GOLDEN.planetaryHours.date)}&tz=${encodeURIComponent(
        GOLDEN.planetaryHours.tz
      )}&lat=${encodeURIComponent(String(GOLDEN.planetaryHours.lat))}&lon=${encodeURIComponent(
        String(GOLDEN.planetaryHours.lon)
      )}`
    );

    assert(hours.date === GOLDEN.planetaryHours.date, 'planetaryHours.date mismatch');
    assert(hours.timezone === GOLDEN.planetaryHours.tz, 'planetaryHours.timezone mismatch');
    assert(hours.sunriseUtc === GOLDEN.planetaryHours.expected.sunriseUtc, 'sunriseUtc mismatch');
    assert(hours.sunsetUtc === GOLDEN.planetaryHours.expected.sunsetUtc, 'sunsetUtc mismatch');
    assert(
      hours.nextSunriseUtc === GOLDEN.planetaryHours.expected.nextSunriseUtc,
      'nextSunriseUtc mismatch'
    );
    assert(hours.dayRuler === GOLDEN.planetaryHours.expected.dayRuler, 'dayRuler mismatch');
    assert(Array.isArray(hours.hours) && hours.hours.length === 24, 'hours.hours must be length 24');

    const hour1 = hours.hours[0];
    assert(hour1.index === GOLDEN.planetaryHours.expected.hour1.index, 'hour1.index mismatch');
    assert(hour1.ruler === GOLDEN.planetaryHours.expected.hour1.ruler, 'hour1.ruler mismatch');
    assert(hour1.isDay === GOLDEN.planetaryHours.expected.hour1.isDay, 'hour1.isDay mismatch');
    assert(hour1.startUtc === GOLDEN.planetaryHours.expected.hour1.startUtc, 'hour1.startUtc mismatch');
    assert(hour1.endUtc === GOLDEN.planetaryHours.expected.hour1.endUtc, 'hour1.endUtc mismatch');

    // Boundary invariants.
    assert(
      hours.hours[0].startUtc === hours.sunriseUtc,
      'Hour 1 startUtc must equal sunriseUtc'
    );
    assert(
      hours.hours[11].endUtc === GOLDEN.planetaryHours.expected.hour12EndUtc,
      'Hour 12 endUtc must equal sunsetUtc'
    );
    assert(
      hours.hours[23].endUtc === GOLDEN.planetaryHours.expected.hour24EndUtc,
      'Hour 24 endUtc must equal nextSunriseUtc'
    );

    for (let i = 0; i < 23; i++) {
      assert(
        hours.hours[i].endUtc === hours.hours[i + 1].startUtc,
        `Hour boundary mismatch: ${i + 1} endUtc != ${i + 2} startUtc`
      );
    }

    console.log('golden tests: PASS');
  } finally {
    kill();
    await sleep(250);
  }
}

run().catch((err) => {
  console.error('golden tests: FAIL');
  console.error(err);
  process.exit(1);
});
