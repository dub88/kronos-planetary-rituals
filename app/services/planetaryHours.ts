import { DateTime } from 'luxon';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { chaldeanOrder, planetaryDayRulers, planetDayMap } from '../constants/planets';
import type { PlanetaryHour } from '../../types';

import type { PlanetDay } from '../types';

// Traditional Chaldean order for planetary hours
// This is the correct sequence for planetary hours
const PLANETARY_HOUR_SEQUENCE: PlanetDay[] = [
  'saturn',  // ♄ Saturn
  'jupiter', // ♃ Jupiter
  'mars',    // ♂ Mars
  'sun',     // ☉ Sun
  'venus',   // ♀ Venus
  'mercury', // ☿ Mercury
  'moon'     // ☽ Moon
];

/**
 * Calculate planetary hours with improved accuracy
 *
 * @param date Date to calculate hours for
 * @param latitude Latitude for location
 * @param longitude Longitude for location
 */
export const calculatePlanetaryHours = async (
  latitude: number,
  longitude: number,
  date: Date,
  timezone: string = 'local'
): Promise<PlanetaryHour[]> => {
  // Validate inputs
  const validLatitude = !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 0;
  const validLongitude = !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? longitude : 0;
  const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  
  // Use the provided date to calculate sunrise/sunset
  const dt = DateTime.fromJSDate(validDate).setZone(timezone);
  
  try {
    // Get the date at the start of the day for consistent calculations
    const today = dt.startOf('day');
    
    // Calculate sunrise and sunset for today
    const sunriseToday = getSunrise(validLatitude, validLongitude, today.toJSDate());
    const sunsetToday = getSunset(validLatitude, validLongitude, today.toJSDate());
    
    // Calculate sunrise for tomorrow
    const tomorrow = today.plus({ days: 1 });
    const sunriseTomorrow = getSunrise(validLatitude, validLongitude, tomorrow.toJSDate());
    
    // Convert to DateTime objects in the correct timezone
    const sunriseTime = DateTime.fromJSDate(sunriseToday).setZone(timezone);
    const sunsetTime = DateTime.fromJSDate(sunsetToday).setZone(timezone);
    const nextSunriseTime = DateTime.fromJSDate(sunriseTomorrow).setZone(timezone);
    
    // Calculate durations (ensure positive values)
    const dayDuration = Math.abs(sunsetTime.diff(sunriseTime, 'minutes').minutes);
    const nightDuration = Math.abs(nextSunriseTime.diff(sunsetTime, 'minutes').minutes);
    
    // Calculate hour durations - ensure we divide exactly by 12 to avoid rounding errors
    const dayHourDuration = dayDuration / 12;
    const nightHourDuration = nightDuration / 12;
    
    console.log('Day duration in hours:', dayDuration / 60);
    console.log('Night duration in hours:', nightDuration / 60);
    
    console.log('Today:', today.toFormat('yyyy-MM-dd'));
    console.log('Current time:', dt.toFormat('HH:mm:ss'));
    console.log('Sunrise Today:', sunriseTime.toFormat('HH:mm:ss'));
    console.log('Sunset Today:', sunsetTime.toFormat('HH:mm:ss'));
    console.log('Sunrise Tomorrow:', nextSunriseTime.toFormat('HH:mm:ss'));
    console.log('Day Duration (minutes):', dayDuration);
    console.log('Night Duration (minutes):', nightDuration);
    console.log('Day Hour Duration (minutes):', dayHourDuration);
    console.log('Night Hour Duration (minutes):', nightHourDuration);

    // Get the day of week (0-6, where 0 is Sunday)
    // Luxon uses 1-7 where 7 is Sunday, so we need to convert
    const dayOfWeek = dt.weekday === 7 ? 0 : dt.weekday % 7;
    
    // Get the ruling planet for this day
    const dayRuler: PlanetDay = planetaryDayRulers[dayOfWeek];
    
    console.log('Day of week:', dt.weekdayLong, '(', dayOfWeek, ')');
    console.log('Day ruling planet:', dayRuler);

    const planetaryHours: PlanetaryHour[] = [];
    
    // Determine if the current time is during day or night
    const now = dt.toMillis();
    const isDuringDay = now >= sunriseTime.toMillis() && now < sunsetTime.toMillis();
    console.log('Current time is during:', isDuringDay ? 'day' : 'night');
    
    // Find the index of the day ruler in the planetary hour sequence
    // This is crucial for determining the correct sequence of hours
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
    if (dayRulerIndex === -1) {
      throw new Error(`Day ruler ${dayRuler} not found in planetary hour sequence`);
    }
    
    // Calculate the 24 planetary hours
    // First hour of the day starts at sunrise and is ruled by the day ruler
    for (let hourNumber = 1; hourNumber <= 24; hourNumber++) {
      // Determine if this is a day hour (1-12) or night hour (13-24)
      const isDayHour = hourNumber <= 12;
      
      // Calculate the position in the planetary sequence
      // The first hour of the day is ruled by the day ruler
      // Each subsequent hour follows the traditional sequence
      const sequencePosition = (dayRulerIndex + hourNumber - 1) % 7;
      const planetName: PlanetDay = PLANETARY_HOUR_SEQUENCE[sequencePosition];
      
      // Calculate start and end times for this hour
      let startTime, endTime;
      
      if (isDayHour) {
        // Day hours (1-12) start at sunrise and each lasts dayHourDuration
        const hourIndex = hourNumber - 1; // Convert to 0-based index
        startTime = sunriseTime.plus({ minutes: hourIndex * dayHourDuration });
        endTime = startTime.plus({ minutes: dayHourDuration });
        
        // Ensure the last day hour (12) doesn't go past sunset
        if (hourNumber === 12) {
          endTime = sunsetTime;
        }
      } else {
        // Night hours (13-24) start at sunset and each lasts nightHourDuration
        const nightHourIndex = hourNumber - 13; // Convert to 0-based index (0-11)
        startTime = sunsetTime.plus({ minutes: nightHourIndex * nightHourDuration });
        endTime = startTime.plus({ minutes: nightHourDuration });
        
        // Ensure the last night hour (24) doesn't go past sunrise
        if (hourNumber === 24) {
          endTime = nextSunriseTime;
        }
      }

      // Check if this is the current hour
      const isCurrentHour = now >= startTime.toMillis() && now < endTime.toMillis();
      
      // Create a planetary hour object that matches the PlanetaryHour interface
      planetaryHours.push({
        hour: hourNumber, // 1-24 hour of the day
        hourNumber: hourNumber,
        planet: planetName,
        planetId: planetName,
        period: isDayHour ? 'day' : 'night',
        isDay: isDayHour,
        startTime: startTime.toJSDate(),
        endTime: endTime.toJSDate(),
        isCurrentHour
      });
      
      // Log the first and thirteenth hours for verification
      if (hourNumber === 1 || hourNumber === 13) {
        console.log(`Hour ${hourNumber} (${isDayHour ? 'day' : 'night'}) ruler: ${planetName}`);
        console.log(`  Start: ${startTime.toFormat('HH:mm:ss')}, End: ${endTime.toFormat('HH:mm:ss')}`);
      }
    }
    
    return planetaryHours;
  } catch (error) {
    console.error('Error calculating planetary hours:', error);
    return [];
  }
};

/**
 * Find the current planetary hour based on the given date and location
 */
export const findCurrentPlanetaryHour = async (
  latitude: number,
  longitude: number,
  date: Date,
  timezone: string = 'local'
): Promise<PlanetaryHour | null> => {
  try {
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? new Date(date) : new Date();
    const validLatitude = !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 40.7128;
    const validLongitude = !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? longitude : -74.0060;
    
    // Await the promise from calculatePlanetaryHours
    const planetaryHours = await calculatePlanetaryHours(validLatitude, validLongitude, validDate, timezone);
    const now = validDate.getTime();
    
    // Find current hour
    const currentHour = planetaryHours.find((hour: PlanetaryHour) => 
      now >= hour.startTime.getTime() && now < hour.endTime.getTime()
    );
    
    // Handle edge case at day boundary
    if (!currentHour && planetaryHours.length > 0) {
      const lastHour = planetaryHours[planetaryHours.length - 1];
      const firstHour = planetaryHours[0];
      
      if (now >= lastHour.endTime.getTime()) {
        // Calculate hours for next day
        const nextDay = new Date(validDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return findCurrentPlanetaryHour(validLatitude, validLongitude, nextDay, timezone);
      } else if (now < firstHour.startTime.getTime()) {
        // Calculate hours for previous day
        const prevDay = new Date(validDate);
        prevDay.setDate(prevDay.getDate() - 1);
        return findCurrentPlanetaryHour(validLatitude, validLongitude, prevDay, timezone);
      }
    }
    
    return currentHour || null;
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
