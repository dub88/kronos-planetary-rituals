import { DateTime } from 'luxon';
import { chaldeanOrder, planetaryDayRulers, planetarySymbols } from '../constants/planets';
import type { PlanetName, PlanetaryHour } from '../app-types';

let SunCalc: any;
try {
  SunCalc = require('suncalc');
} catch (error) {
  SunCalc = {
    getTimes: (date: Date, lat: number, lng: number) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const sunrise = new Date(year, month, day, 6, 0, 0);
      const sunset = new Date(year, month, day, 18, 0, 0);
      return { sunrise, sunset };
    }
  };
}

/**
 * Calculates the planetary hours for a given date and location.
 * @param latitude - The latitude of the location
 * @param longitude - The longitude of the location
 * @param date - The date for which to calculate planetary hours
 * @param timezone - The timezone of the location (e.g., 'America/New_York')
 * @param wakingHourStart - Optional: The start of waking hours (0-23)
 * @param wakingHourEnd - Optional: The end of waking hours (0-23)
 * @returns An array of planetary hour objects
 */
export const calculatePlanetaryHours = async (
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezone: string = 'UTC',
  wakingHourStart: number = 6,
  wakingHourEnd: number = 22,
  now: Date = new Date()
): Promise<PlanetaryHour[]> => {
  const validLatitude = !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 0;
  const validLongitude = !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? longitude : 0;
  const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  const dayOfWeek = validDate.getDay();
  const rulingPlanet = planetaryDayRulers[dayOfWeek] as PlanetName;
  const startIndex = chaldeanOrder.indexOf(rulingPlanet);

  const times = SunCalc.getTimes(validDate, validLatitude, validLongitude);
  const sunrise = DateTime.fromJSDate(times.sunrise).setZone(timezone);
  const sunset = DateTime.fromJSDate(times.sunset).setZone(timezone);

  const nextDate = new Date(validDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextTimes = SunCalc.getTimes(nextDate, validLatitude, validLongitude);
  const nextSunrise = DateTime.fromJSDate(nextTimes.sunrise).setZone(timezone);

  const dayDuration = sunset.diff(sunrise, 'minutes').minutes;
  const nightDuration = nextSunrise.diff(sunset, 'minutes').minutes;
  const dayHourLength = dayDuration / 12;
  const nightHourLength = nightDuration / 12;

  const nowDateTime = DateTime.fromJSDate(now).setZone(timezone);
  const today = nowDateTime.startOf('day');
  const tomorrow = today.plus({ days: 1 });
  const yesterday = today.minus({ days: 1 });

  const dayLabel = (date: DateTime): string => {
    if (date.hasSame(today, 'day')) {
      return 'today';
    }
    if (date.hasSame(tomorrow, 'day')) {
      return 'tomorrow';
    }
    if (date.hasSame(yesterday, 'day')) {
      return 'yesterday';
    }
    return '';
  };

  const planetaryHours: PlanetaryHour[] = [];

  for (let i = 0; i < 24; i++) {
    let startTime: DateTime, endTime: DateTime;
    const isDayHour = i < 12;

    if (isDayHour) {
      startTime = sunrise.plus({ minutes: i * dayHourLength });
      endTime = sunrise.plus({ minutes: (i + 1) * dayHourLength });

      if (i === 11) {
        endTime = sunset;
      }
    } else {
      const nightIndex = i - 12;
      startTime = sunset.plus({ minutes: nightIndex * nightHourLength });
      endTime = sunset.plus({ minutes: (nightIndex + 1) * nightHourLength });

      if (i === 23) {
        endTime = nextSunrise;
      }
    }

    const label = dayLabel(startTime);

    const planetName = chaldeanOrder[(startIndex + i) % 7] as PlanetName;

    const dateTime = DateTime.fromJSDate(validDate).setZone(timezone);
    const isToday = dateTime.hasSame(nowDateTime, 'day');
    const isCurrentHour = isToday && (nowDateTime >= startTime && nowDateTime < endTime);

    planetaryHours.push({
      hourNumber: i + 1,
      planet: planetName,
      planetId: planetName,
      period: isDayHour ? 'day' : 'night',
      isDayHour: isDayHour,
      startTime: startTime.toJSDate(),
      endTime: endTime.toJSDate(),
      isCurrentHour,
      label
    });
  }
  return planetaryHours;
};

/**
 * Find the current planetary hour based on the given date and location
 */
export const findCurrentPlanetaryHour = async (
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezone: string = 'UTC'
): Promise<PlanetaryHour | null> => {
  try {
    // Validate inputs to prevent errors
    const validLatitude = !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 0;
    const validLongitude = !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? longitude : 0;
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    // Get the current time in the specified timezone
    const now = DateTime.local().setZone(timezone);
    // Calculate all planetary hours for the day
    const planetaryHours = await calculatePlanetaryHours(validLatitude, validLongitude, validDate, timezone);
    if (planetaryHours.length === 0) {
      console.warn('No planetary hours calculated');
      return null;
    }
    // Find the current hour
    const currentHour = planetaryHours.find(hour => hour.isCurrentHour);
    if (currentHour) {
      return currentHour;
    } else {
      // Check if we need to look at the next or previous day
      const firstHour = planetaryHours[0];
      const lastHour = planetaryHours[planetaryHours.length - 1];
      const firstHourStart = DateTime.fromJSDate(firstHour.startTime);
      const lastHourEnd = DateTime.fromJSDate(lastHour.endTime);
      if (now > lastHourEnd) {
        // Calculate hours for next day
        const nextDay = new Date(validDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return findCurrentPlanetaryHour(validLatitude, validLongitude, nextDay, timezone);
      } else if (now < firstHourStart) {
        // Calculate hours for previous day
        const prevDay = new Date(validDate);
        prevDay.setDate(prevDay.getDate() - 1);
        return findCurrentPlanetaryHour(validLatitude, validLongitude, prevDay, timezone);
      }
    }
    console.warn('Could not determine current planetary hour');
    return null;
  } catch (error) {
    console.error('Error finding current planetary hour:', error);
    return null;
  }
};

// Create the service object with all exported functions
const PlanetaryHoursService = {
  calculatePlanetaryHours,
  findCurrentPlanetaryHour
};

// Export the service and individual functions
module.exports = {
  calculatePlanetaryHours,
  findCurrentPlanetaryHour
};

module.exports.default = PlanetaryHoursService;
