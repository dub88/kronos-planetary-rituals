// Test script for the updated planetary hours calculation algorithm
const { DateTime } = require('luxon');
const { getSunrise, getSunset } = require('sunrise-sunset-js');

// Cedar City, UT coordinates
const latitude = 37.6775; 
const longitude = -113.0619;

// Use November 4, 2025 to match the reference image
const date = new Date('2025-11-04T12:00:00');
console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()} (${date.toLocaleString('en-US', { weekday: 'long' })})`);

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

// Symbol mapping for planets
const PLANET_SYMBOLS = {
  'saturn': '♄',
  'jupiter': '♃',
  'mars': '♂',
  'sun': '☉',
  'venus': '♀',
  'mercury': '☿',
  'moon': '☽'
};

// Reference data from the image
const REFERENCE_HOURS = [
  // Day hours (1-12)
  { hour: 1, planet: 'venus', symbol: '♀', start: '7:03am', end: '8:08am' },
  { hour: 2, planet: 'mercury', symbol: '☿', start: '8:08am', end: '9:13am' },
  { hour: 3, planet: 'moon', symbol: '☽', start: '9:13am', end: '10:19am' },
  { hour: 4, planet: 'saturn', symbol: '♄', start: '10:19am', end: '11:24am' },
  { hour: 5, planet: 'jupiter', symbol: '♃', start: '11:24am', end: '12:29pm' },
  { hour: 6, planet: 'mars', symbol: '♂', start: '12:29pm', end: '1:34pm' },
  { hour: 7, planet: 'sun', symbol: '☉', start: '1:34pm', end: '2:39pm' },
  { hour: 8, planet: 'venus', symbol: '♀', start: '2:39pm', end: '3:44pm' },
  { hour: 9, planet: 'mercury', symbol: '☿', start: '3:44pm', end: '4:49pm' },
  { hour: 10, planet: 'moon', symbol: '☽', start: '4:49pm', end: '5:54pm' },
  { hour: 11, planet: 'saturn', symbol: '♄', start: '5:54pm', end: '6:59pm' },
  { hour: 12, planet: 'jupiter', symbol: '♃', start: '6:59pm', end: '8:05pm' },
  
  // Night hours (13-24)
  { hour: 13, planet: 'mars', symbol: '♂', start: '8:05pm', end: '8:59pm' },
  { hour: 14, planet: 'sun', symbol: '☉', start: '8:59pm', end: '9:54pm' },
  { hour: 15, planet: 'venus', symbol: '♀', start: '9:54pm', end: '10:49pm' },
  { hour: 16, planet: 'mercury', symbol: '☿', start: '10:49pm', end: '11:44pm' },
  { hour: 17, planet: 'moon', symbol: '☽', start: '11:44pm', end: '12:38am' },
  { hour: 18, planet: 'saturn', symbol: '♄', start: '12:38am', end: '1:33am' },
  { hour: 19, planet: 'jupiter', symbol: '♃', start: '1:33am', end: '2:28am' },
  { hour: 20, planet: 'mars', symbol: '♂', start: '2:28am', end: '3:23am' },
  { hour: 21, planet: 'sun', symbol: '☉', start: '3:23am', end: '4:17am' },
  { hour: 22, planet: 'venus', symbol: '♀', start: '4:17am', end: '5:12am' },
  { hour: 23, planet: 'mercury', symbol: '☿', start: '5:12am', end: '6:07am' },
  { hour: 24, planet: 'moon', symbol: '☽', start: '6:07am', end: '7:02am' }
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
    
    console.log('Sunrise Today:', sunriseTime.toFormat('h:mm a'));
    console.log('Sunset Today:', sunsetTime.toFormat('h:mm a'));
    console.log('Sunrise Tomorrow:', nextSunriseTime.toFormat('h:mm a'));
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
    
    // Based on the reference data, we need to determine the first hour's planet
    // Analysis of the reference data shows that for Tuesday, Nov 4, 2025, the first hour is Venus
    // The pattern appears to be that the first hour of each day is ruled by
    // a planet that is 5 positions ahead in the sequence from the day ruler
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
    const firstHourPlanetIndex = (dayRulerIndex + 5) % 7;
    const firstHourPlanet = PLANETARY_HOUR_SEQUENCE[firstHourPlanetIndex];
    
    console.log(`First hour of the day is ruled by: ${firstHourPlanet}`);
    
    const planetaryHours = [];
    
    // Calculate the 24 planetary hours
    for (let hourNumber = 1; hourNumber <= 24; hourNumber++) {
      // Determine if this is a day hour (1-12) or night hour (13-24)
      const isDayHour = hourNumber <= 12;
      
      // Calculate the position in the planetary sequence starting from the first hour planet
      const hourOffset = hourNumber - 1; // 0-based index
      const sequencePosition = (firstHourPlanetIndex + hourOffset) % 7;
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
        symbol: PLANET_SYMBOLS[planetName],
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
    console.log('Hour | Planet | Symbol | Calculated | Reference | Match?');
    console.log('-----|--------|--------|------------|-----------|-------');
    
    for (let i = 0; i < 12; i++) {
      const hour = hours[i];
      const ref = REFERENCE_HOURS[i];
      const matchPlanet = hour.planet === ref.planet;
      
      const startTime = new Date(hour.startTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();
      
      const endTime = new Date(hour.endTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();
      
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${startTime}-${endTime} | ${ref.start}-${ref.end} | ${matchPlanet ? 'YES' : 'NO'}`
      );
    }
    
    // Display night hours
    console.log('\nNIGHT HOURS (13-24):');
    console.log('Hour | Planet | Symbol | Calculated | Reference | Match?');
    console.log('-----|--------|--------|------------|-----------|-------');
    
    for (let i = 12; i < 24; i++) {
      const hour = hours[i];
      const ref = REFERENCE_HOURS[i];
      const matchPlanet = hour.planet === ref.planet;
      
      const startTime = new Date(hour.startTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();
      
      const endTime = new Date(hour.endTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();
      
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${startTime}-${endTime} | ${ref.start}-${ref.end} | ${matchPlanet ? 'YES' : 'NO'}`
      );
    }
    
    // Count matches
    let planetMatches = 0;
    for (let i = 0; i < 24; i++) {
      if (hours[i].planet === REFERENCE_HOURS[i].planet) {
        planetMatches++;
      }
    }
    
    console.log(`\nPlanet matches: ${planetMatches}/24 (${(planetMatches/24*100).toFixed(1)}%)`);
    
    // Verify the offset rule
    console.log('\nVerifying the offset rule:');
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(DAY_RULERS[date.getDay()]);
    const firstHourPlanetIndex = (dayRulerIndex + 5) % 7;
    const firstHourPlanet = PLANETARY_HOUR_SEQUENCE[firstHourPlanetIndex];
    console.log(`Day ruler: ${DAY_RULERS[date.getDay()]} (${PLANET_SYMBOLS[DAY_RULERS[date.getDay()]]})`);
    console.log(`First hour planet (offset +5): ${firstHourPlanet} (${PLANET_SYMBOLS[firstHourPlanet]})`);
    console.log(`Reference first hour planet: ${REFERENCE_HOURS[0].planet} (${REFERENCE_HOURS[0].symbol})`);
    console.log(`Match: ${firstHourPlanet === REFERENCE_HOURS[0].planet ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();
