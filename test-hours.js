// Test script for planetary hours calculation
const fs = require('fs');
const { DateTime } = require('luxon');
const { getSunrise, getSunset } = require('sunrise-sunset-js');

// Cedar City, UT coordinates
const latitude = 37.6775; 
const longitude = -113.0619;

// Current date
const date = new Date();
console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()}`);

// Planetary day rulers (starting with Sunday)
const planetaryDayRulers = [
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

    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = dt.weekday === 7 ? 0 : dt.weekday % 7;
    
    // Get the ruling planet for this day
    const dayRuler = planetaryDayRulers[dayOfWeek];
    
    console.log('Day of week:', dt.weekdayLong, '(', dayOfWeek, ')');
    console.log('Day ruling planet:', dayRuler);

    const planetaryHours = [];
    
    // Determine if the current time is during day or night
    const now = dt.toMillis();
    
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
      const sequencePosition = (dayRulerIndex + hourNumber - 1) % 7;
      const planetName = PLANETARY_HOUR_SEQUENCE[sequencePosition];
      
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
      
      // Create a planetary hour object
      planetaryHours.push({
        hour: hourNumber,
        hourNumber: hourNumber,
        planet: planetName,
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
    
    // Find current hour
    const currentHour = hours.find(h => h.isCurrentHour);
    if (currentHour) {
      console.log('\nCURRENT HOUR:');
      console.log(`Hour ${currentHour.hourNumber} (${currentHour.planet}): ${formatTime(currentHour.startTime)} - ${formatTime(currentHour.endTime)}`);
    } else {
      console.log('\nNo current hour found');
    }
    
    // Save results to file for reference
    fs.writeFileSync('planetary-hours-results.json', JSON.stringify(hours, null, 2));
    console.log('\nResults saved to planetary-hours-results.json');
    
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
