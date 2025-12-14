# Kronos (PWA)

Web-first Progressive Web App rebuild of **Kronos Planetary Rituals**.

This app provides:

- **Astronomically correct** (via `astronomy-engine`) planetary positions.
- **Planetary hours** based on sunrise/sunset for a given location.

## Requirements

- Node.js 18+

## Run locally

```bash
npm install
npm run dev
```

Optional defaults (when geolocation is unavailable):

- Copy `env.example` to `.env.local` and edit values.

Then open:

- `http://localhost:3000/` (Today)
- `http://localhost:3000/calendar` (Planetary hours by date)

## Server API

### `GET /api/positions`

Returns **geocentric** ecliptic longitudes (true ecliptic of date) for the classical bodies.

Query params:

- `timestamp` (optional): ISO string or milliseconds since epoch. Defaults to now.

Response shape:

```json
{
  "timestampUtc": "2025-01-01T00:00:00.000Z",
  "positions": [
    {
      "planet": "mars",
      "longitude": 121.91730636403625,
      "sign": "Leo",
      "degreeInSign": 1.9173063640362525,
      "isRetrograde": true
    }
  ]
}
```

Implementation notes:

- Sun uses `SunPosition(date).elon`.
- Moon uses `EclipticGeoMoon(date).lon`.
- Planets use `GeoVector(body, date, true)` then `Ecliptic(vec).elon`.

### `GET /api/planetary-hours`

Returns sunrise/sunset/nextSunrise and the 24 planetary-hour intervals.

Query params:

- `lat` (required): latitude (decimal degrees)
- `lon` (required): longitude (decimal degrees)
- `tz` (optional): IANA timezone name (e.g. `America/Denver`), defaults to `UTC`
- `date` (optional): local date `YYYY-MM-DD` in `tz`, defaults to today in `tz`

Response shape (abridged):

```json
{
  "date": "2025-01-01",
  "timezone": "America/Denver",
  "latitude": 40.7608,
  "longitude": -111.891,
  "sunriseUtc": "2025-01-01T14:51:47.271Z",
  "sunsetUtc": "2025-01-02T00:11:08.436Z",
  "nextSunriseUtc": "2025-01-02T14:51:51.824Z",
  "dayRuler": "mercury",
  "hours": [
    {
      "index": 1,
      "ruler": "mercury",
      "isDay": true,
      "startUtc": "2025-01-01T14:51:47.271Z",
      "endUtc": "2025-01-01T15:38:24.034Z",
      "startLocal": "2025-01-01T07:51:47.271-07:00",
      "endLocal": "2025-01-01T08:38:24.034-07:00",
      "isCurrent": false
    }
  ]
}
```

## Golden regression tests

This repo includes a “golden” test that starts a Next dev server and asserts fixed reference outputs for:

- `/api/positions?timestamp=2025-01-01T00:00:00.000Z`
- `/api/planetary-hours?date=2025-01-01&tz=America/Denver&lat=40.7608&lon=-111.891`

Run:

```bash
npm run test:golden
```

If you intentionally change astronomy algorithms/parameters, you will need to update the `GOLDEN` constants in:

- `scripts/golden.test.mjs`
