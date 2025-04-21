// Test script for Cedar City, UT on April 11th, 2025 at current time (5:07 PM)
const { DateTime } = require('luxon');
const SunCalc = require('suncalc');

// Cedar City, UT coordinates
const latitude = 37.6775; 
const longitude = -113.0619;

// April 11th, 2025 (Friday)
const date = new Date('2025-04-11T12:00:00');
const timezone = 'America/Denver';

// Current time for testing
const currentTimeString = '2025-04-11T17:07:06-06:00';
const currentTime = DateTime.fromISO(currentTimeString);

console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()} (${date.toLocaleString('en-US', { weekday: 'long' })})`);
console.log(`Current time: ${currentTime.toFormat('h:mm a')}`);

// Define the constants here instead of importing them
// Chaldean order of the planets (from slowest to fastest)
const chaldeanOrder = [
  'saturn',  // Saturn
  'jupiter', // Jupiter
  'mars',    // Mars
  'sun',     // Sun
  'venus',   // Venus
  'mercury', // Mercury
  'moon'     // Moon
];

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

// Symbol mapping for planets
const planetarySymbols = {
  'saturn': '♄',
  'jupiter': '♃',
  'mars': '♂',
  'sun': '☉',
  'venus': '♀',
  'mercury': '☿',
  'moon': '☽'
};

// Calculate planetary hours
async function calculatePlanetaryHours(latitude, longitude, date, timezone) {
  console.log(`Calculating planetary hours for ${DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')} at ${latitude}, ${longitude}`);
  
  try {
    // Get the day of the week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    const rulingPlanet = planetaryDayRulers[dayOfWeek];
    const startIndex = chaldeanOrder.indexOf(rulingPlanet);
    
    // Calculate sunrise and sunset times for the given date and location
    const times = SunCalc.getTimes(date, latitude, longitude);
    const sunrise = DateTime.fromJSDate(times.sunrise).setZone(timezone);
    const sunset = DateTime.fromJSDate(times.sunset).setZone(timezone);
    
    // Calculate sunrise for the next day to determine the end of the night
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextTimes = SunCalc.getTimes(nextDate, latitude, longitude);
    const nextSunrise = DateTime.fromJSDate(nextTimes.sunrise).setZone(timezone);
    
    // Calculate the duration of day and night in minutes
    const dayDuration = sunset.diff(sunrise, 'minutes').minutes;
    const nightDuration = nextSunrise.diff(sunset, 'minutes').minutes;
    
    // Calculate the length of each planetary hour
    const dayHourLength = dayDuration / 12;
    const nightHourLength = nightDuration / 12;
    
    console.log(`Sunrise: ${sunrise.toFormat('HH:mm')}`)
    console.log(`Sunset: ${sunset.toFormat('HH:mm')}`)
    console.log(`Next Sunrise: ${nextSunrise.toFormat('HH:mm')}`)
    console.log(`Day Duration: ${dayDuration.toFixed(2)} minutes`)
    console.log(`Night Duration: ${nightDuration.toFixed(2)} minutes`)
    console.log(`Day Hour Length: ${dayHourLength.toFixed(2)} minutes`)
    console.log(`Night Hour Length: ${nightHourLength.toFixed(2)} minutes`)
    console.log(`Day of week: ${DateTime.fromJSDate(date).weekdayLong} (${dayOfWeek})`)
    console.log(`Day ruling planet: ${rulingPlanet}`)
    
    // Array to store the 24 planetary hours
    const planetaryHours = [];
    
    // Loop through all 24 hours
    for (let i = 0; i < 24; i++) {
      let startTime, endTime;
      const isDayHour = i < 12;
      
      if (isDayHour) {
        // Day hours (sunrise to sunset)
        startTime = sunrise.plus({ minutes: i * dayHourLength });
        endTime = sunrise.plus({ minutes: (i + 1) * dayHourLength });
        
        // Ensure the last day hour ends exactly at sunset
        if (i === 11) {
          endTime = sunset;
        }
      } else {
        // Night hours (sunset to next sunrise)
        const nightIndex = i - 12;
        startTime = sunset.plus({ minutes: nightIndex * nightHourLength });
        endTime = sunset.plus({ minutes: (nightIndex + 1) * nightHourLength });
        
        // Ensure the last night hour ends exactly at next sunrise
        if (i === 23) {
          endTime = nextSunrise;
        }
      }
      
      // Assign the planet using the Chaldean order, cycling through with modulo
      const planetName = chaldeanOrder[(startIndex + i) % 7];
      
      // Add the hour to the array
      planetaryHours.push({
        hour: i + 1,
        hourNumber: i + 1,
        planet: planetName,
        planetId: planetName,
        symbol: planetarySymbols[planetName],
        period: isDayHour ? 'day' : 'night',
        isDay: isDayHour,
        startTime: startTime.toJSDate(),
        endTime: endTime.toJSDate(),
        isCurrentHour: currentTime >= startTime && currentTime < endTime
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
    const hours = await calculatePlanetaryHours(latitude, longitude, date, timezone);
    
    console.log('\n=== PLANETARY HOURS CALCULATION RESULTS ===\n');
    
    // Display day hours
    console.log('DAY HOURS (1-12):');
    console.log('Hour | Planet | Symbol | Start Time | End Time | Current?');
    console.log('-----|--------|--------|------------|----------|----------');
    
    for (let i = 0; i < 12; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${formatTime(hour.startTime)} | ${formatTime(hour.endTime)} | ${hour.isCurrentHour ? 'CURRENT' : ''}`
      );
    }
    
    // Display night hours
    console.log('\nNIGHT HOURS (13-24):');
    console.log('Hour | Planet | Symbol | Start Time | End Time | Current?');
    console.log('-----|--------|--------|------------|----------|----------');
    
    for (let i = 12; i < 24; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${formatTime(hour.startTime)} | ${formatTime(hour.endTime)} | ${hour.isCurrentHour ? 'CURRENT' : ''}`
      );
    }
    
    // Verify first hour is ruled by the day ruler
    const firstHour = hours[0];
    const dayRuler = planetaryDayRulers[date.getDay()];
    console.log(`\nVerification: First hour planet is ${firstHour.planet}, day ruler is ${dayRuler}`);
    console.log(`Match: ${firstHour.planet === dayRuler ? 'YES' : 'NO'}`);
    
    // Find the current planetary hour
    let currentHour = hours.find(hour => hour.isCurrentHour);
    
    if (currentHour) {
      console.log(`\nCurrent planetary hour at ${currentTime.toFormat('h:mm a')}:`);
      console.log(`Hour ${currentHour.hourNumber}: ${currentHour.planet} (${currentHour.symbol}) (${formatTime(currentHour.startTime)} - ${formatTime(currentHour.endTime)})`);
      
      // Calculate progress through current hour
      const hourStart = DateTime.fromJSDate(currentHour.startTime);
      const hourEnd = DateTime.fromJSDate(currentHour.endTime);
      const hourDuration = hourEnd.diff(hourStart, 'minutes').minutes;
      const elapsedTime = currentTime.diff(hourStart, 'minutes').minutes;
      const progressPercent = (elapsedTime / hourDuration * 100).toFixed(2);
      
      console.log(`Progress through current hour: ${elapsedTime.toFixed(2)} minutes of ${hourDuration.toFixed(2)} minutes (${progressPercent}%)`);
      
      // Show next hour
      const nextHourIndex = currentHour.hourNumber % 24;
      const nextHour = hours[nextHourIndex];
      console.log(`\nNext planetary hour:`);
      console.log(`Hour ${nextHour.hourNumber}: ${nextHour.planet} (${nextHour.symbol}) (${formatTime(nextHour.startTime)} - ${formatTime(nextHour.endTime)})`);
    } else {
      console.log('\nCould not determine current planetary hour.');
    }
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

runTest();
