// Test script for the updated planetary hours calculation
const { DateTime } = require('luxon');
const { getSunrise, getSunset } = require('sunrise-sunset-js');

// Cedar City, UT coordinates
const latitude = 37.6775; 
const longitude = -113.0619;

// Use November 4, 2025 to match the reference image
const date = new Date('2025-11-04T12:00:00');
console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()}`);

// Planetary day rulers (starting with Sunday)
const DAY_RULERS = [
  'sun',     // Sunday
  'moon',    // Monday
  'mars',    // Tuesday
  'mercury', // Wednesday
  'jupiter', // Thursday
  'venus',   // Friday
  'saturn'   // Saturday
];

// Traditional Chaldean order for planetary hours
const PLANETARY_HOUR_SEQUENCE = [
  'saturn',  // Saturn
  'jupiter', // Jupiter
  'mars',    // Mars
  'sun',     // Sun
  'venus',   // Venus
  'mercury', // Mercury
  'moon'     // Moon
];

// Calculate planetary hours
async function calculatePlanetaryHours(latitude, longitude, date, timezone = 'America/Denver') {
  // Use the provided date
  const dt = DateTime.fromJSDate(date).setZone(timezone);
  
  try {
    // Get the date at the start of the day
    const today = dt.startOf('day');
    
    // Calculate sunrise and sunset for today
    const sunriseToday = getSunrise(latitude, longitude, today.toJSDate());
    const sunsetToday = getSunset(latitude, longitude, today.toJSDate());
    
    // Calculate sunrise for tomorrow
    const tomorrow = today.plus({ days: 1 });
    const sunriseTomorrow = getSunrise(latitude, longitude, tomorrow.toJSDate());
    
    // Convert to DateTime objects in the correct timezone
    const sunriseTime = DateTime.fromJSDate(sunriseToday).setZone(timezone);
    const sunsetTime = DateTime.fromJSDate(sunsetToday).setZone(timezone);
    const nextSunriseTime = DateTime.fromJSDate(sunriseTomorrow).setZone(timezone);
    
    // Calculate durations
    const dayDuration = Math.abs(sunsetTime.diff(sunriseTime, 'minutes').minutes);
    const nightDuration = Math.abs(nextSunriseTime.diff(sunsetTime, 'minutes').minutes);
    
    // Calculate hour durations
    const dayHourDuration = dayDuration / 12;
    const nightHourDuration = nightDuration / 12;
    
    console.log('Sunrise Today:', sunriseTime.toFormat('HH:mm:ss'));
    console.log('Sunset Today:', sunsetTime.toFormat('HH:mm:ss'));
    console.log('Sunrise Tomorrow:', nextSunriseTime.toFormat('HH:mm:ss'));
    console.log('Day Duration (hours):', (dayDuration / 60).toFixed(2));
    console.log('Night Duration (hours):', (nightDuration / 60).toFixed(2));
    console.log('Day Hour Duration (minutes):', dayHourDuration.toFixed(2));
    console.log('Night Hour Duration (minutes):', nightHourDuration.toFixed(2));

    // Get the day of week (0-6, where 0 is Sunday)
    const jsDate = dt.toJSDate();
    const dayOfWeek = jsDate.getDay();
    
    // Get the ruling planet for this day
    const dayRuler = DAY_RULERS[dayOfWeek];
    
    console.log('Day of week:', dt.weekdayLong, '(', dayOfWeek, ')');
    console.log('Day ruling planet:', dayRuler);

    const planetaryHours = [];
    
    // Find the index of the day ruler in the planetary hour sequence
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
    if (dayRulerIndex === -1) {
      throw new Error(`Day ruler ${dayRuler} not found in planetary hour sequence`);
    }
    
    // Calculate the 24 planetary hours
    for (let hourNumber = 1; hourNumber <= 24; hourNumber++) {
      // Determine if this is a day hour (1-12) or night hour (13-24)
      const isDayHour = hourNumber <= 12;
      
      // Calculate the position in the planetary sequence
      let hourOffset = hourNumber - 1; // 0-based index
      const sequencePosition = (dayRulerIndex + hourOffset) % 7;
      const planetName = PLANETARY_HOUR_SEQUENCE[sequencePosition];
      
      // Calculate start and end times for this hour
      let startTime, endTime;
      
      if (isDayHour) {
        // For day hours (1-12), divide the time between sunrise and sunset into 12 equal parts
        if (hourNumber === 1) {
          // First hour starts at sunrise
          startTime = sunriseTime;
        } else {
          // Calculate start time based on previous hours
          startTime = sunriseTime.plus({ minutes: (hourNumber - 1) * dayHourDuration });
        }
        
        // End time is start time plus the duration of one day hour
        endTime = sunriseTime.plus({ minutes: hourNumber * dayHourDuration });
        
        // Ensure the last day hour doesn't go past sunset
        if (hourNumber === 12) {
          endTime = sunsetTime;
        }
      } else {
        // For night hours (13-24), divide the time between sunset and next sunrise into 12 equal parts
        const nightHourIndex = hourNumber - 13; // 0-based index for night hours
        
        if (hourNumber === 13) {
          // First night hour starts at sunset
          startTime = sunsetTime;
        } else {
          // Calculate start time based on previous night hours
          startTime = sunsetTime.plus({ minutes: nightHourIndex * nightHourDuration });
        }
        
        // End time is start time plus the duration of one night hour
        endTime = sunsetTime.plus({ minutes: (nightHourIndex + 1) * nightHourDuration });
        
        // Ensure the last night hour doesn't go past next sunrise
        if (hourNumber === 24) {
          endTime = nextSunriseTime;
        }
      }

      // Create a planetary hour object
      planetaryHours.push({
        hour: hourNumber,
        hourNumber: hourNumber,
        planet: planetName,
        period: isDayHour ? 'day' : 'night',
        isDay: isDayHour,
        startTime: startTime.toJSDate(),
        endTime: endTime.toJSDate()
      });
    }
    
    return planetaryHours;
  } catch (error) {
    console.error('Error calculating planetary hours:', error);
    return [];
  }
}

// Run the calculation
async function runTest() {
  try {
    const hours = await calculatePlanetaryHours(latitude, longitude, date);
    
    console.log('\n=== PLANETARY HOURS CALCULATION RESULTS ===\n');
    
    // Display day hours
    console.log('DAY HOURS (1-12):');
    console.log('Hour | Planet | Start Time | End Time');
    console.log('-----|--------|------------|----------');
    
    for (let i = 0; i < 12; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hourNumber.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ` +
        `${formatTime(hour.startTime)} | ${formatTime(hour.endTime)}`
      );
    }
    
    // Display night hours
    console.log('\nNIGHT HOURS (13-24):');
    console.log('Hour | Planet | Start Time | End Time');
    console.log('-----|--------|------------|----------');
    
    for (let i = 12; i < 24; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hourNumber.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ` +
        `${formatTime(hour.startTime)} | ${formatTime(hour.endTime)}`
      );
    }
    
    // Compare with reference values
    console.log('\n=== COMPARISON WITH REFERENCE VALUES ===\n');
    console.log('Reference shows:');
    console.log('Hour 1: Venus (7:03am - 8:08am)');
    console.log('Hour 2: Mercury (8:08am - 9:13am)');
    console.log('Hour 13: Mars (8:05pm - 8:59pm)');
    console.log('Hour 14: Sun (8:59pm - 9:54pm)');
    
    // Extract our values for comparison
    const hour1 = hours[0];
    const hour2 = hours[1];
    const hour13 = hours[12];
    const hour14 = hours[13];
    
    console.log('\nOur calculation shows:');
    console.log(`Hour 1: ${hour1.planet} (${formatTime(hour1.startTime)} - ${formatTime(hour1.endTime)})`);
    console.log(`Hour 2: ${hour2.planet} (${formatTime(hour2.startTime)} - ${formatTime(hour2.endTime)})`);
    console.log(`Hour 13: ${hour13.planet} (${formatTime(hour13.startTime)} - ${formatTime(hour13.endTime)})`);
    console.log(`Hour 14: ${hour14.planet} (${formatTime(hour14.startTime)} - ${formatTime(hour14.endTime)})`);
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

runTest();
