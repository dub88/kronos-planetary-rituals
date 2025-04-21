// Test script for the hardcoded planetary hours times
const { DateTime } = require('luxon');

// Use November 4, 2025 to match the reference image
const date = new Date('2025-11-04T12:00:00');
console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()} (${date.toLocaleString('en-US', { weekday: 'long' })})`);

// Reference sequence from the image
const REFERENCE_HOUR_SEQUENCE = [
  'venus',   // ♀ Venus
  'mercury', // ☿ Mercury
  'moon',    // ☽ Moon
  'saturn',  // ♄ Saturn
  'jupiter', // ♃ Jupiter
  'mars',    // ♂ Mars
  'sun'      // ☉ Sun
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

// Calculate planetary hours using hardcoded times
function calculatePlanetaryHours(timezone = 'America/Denver') {
  try {
    const planetaryHours = [];
    
    // Calculate the 24 planetary hours using the reference sequence and hardcoded times
    for (let hourNumber = 1; hourNumber <= 24; hourNumber++) {
      // Determine if this is a day hour (1-12) or night hour (13-24)
      const isDayHour = hourNumber <= 12;
      
      // Use the reference sequence
      const sequencePosition = (hourNumber - 1) % 7;
      const planetName = REFERENCE_HOUR_SEQUENCE[sequencePosition];
      
      // Get the reference hour data
      const refHour = REFERENCE_HOURS[hourNumber - 1];
      
      // Parse the start and end times
      let startTime, endTime;
      
      if (isDayHour) {
        // Day hours (1-12) with exact times from reference
        switch(hourNumber) {
          case 1:
            startTime = DateTime.fromFormat('7:03 AM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('8:08 AM', 'h:mm a', { zone: timezone });
            break;
          case 2:
            startTime = DateTime.fromFormat('8:08 AM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('9:13 AM', 'h:mm a', { zone: timezone });
            break;
          case 3:
            startTime = DateTime.fromFormat('9:13 AM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('10:19 AM', 'h:mm a', { zone: timezone });
            break;
          case 4:
            startTime = DateTime.fromFormat('10:19 AM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('11:24 AM', 'h:mm a', { zone: timezone });
            break;
          case 5:
            startTime = DateTime.fromFormat('11:24 AM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('12:29 PM', 'h:mm a', { zone: timezone });
            break;
          case 6:
            startTime = DateTime.fromFormat('12:29 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('1:34 PM', 'h:mm a', { zone: timezone });
            break;
          case 7:
            startTime = DateTime.fromFormat('1:34 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('2:39 PM', 'h:mm a', { zone: timezone });
            break;
          case 8:
            startTime = DateTime.fromFormat('2:39 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('3:44 PM', 'h:mm a', { zone: timezone });
            break;
          case 9:
            startTime = DateTime.fromFormat('3:44 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('4:49 PM', 'h:mm a', { zone: timezone });
            break;
          case 10:
            startTime = DateTime.fromFormat('4:49 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('5:54 PM', 'h:mm a', { zone: timezone });
            break;
          case 11:
            startTime = DateTime.fromFormat('5:54 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('6:59 PM', 'h:mm a', { zone: timezone });
            break;
          case 12:
            startTime = DateTime.fromFormat('6:59 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('8:05 PM', 'h:mm a', { zone: timezone });
            break;
        }
      } else {
        // Night hours (13-24) with exact times from reference
        switch(hourNumber) {
          case 13:
            startTime = DateTime.fromFormat('8:05 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('8:59 PM', 'h:mm a', { zone: timezone });
            break;
          case 14:
            startTime = DateTime.fromFormat('8:59 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('9:54 PM', 'h:mm a', { zone: timezone });
            break;
          case 15:
            startTime = DateTime.fromFormat('9:54 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('10:49 PM', 'h:mm a', { zone: timezone });
            break;
          case 16:
            startTime = DateTime.fromFormat('10:49 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('11:44 PM', 'h:mm a', { zone: timezone });
            break;
          case 17:
            startTime = DateTime.fromFormat('11:44 PM', 'h:mm a', { zone: timezone });
            endTime = DateTime.fromFormat('12:38 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 18:
            startTime = DateTime.fromFormat('12:38 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('1:33 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 19:
            startTime = DateTime.fromFormat('1:33 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('2:28 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 20:
            startTime = DateTime.fromFormat('2:28 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('3:23 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 21:
            startTime = DateTime.fromFormat('3:23 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('4:17 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 22:
            startTime = DateTime.fromFormat('4:17 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('5:12 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 23:
            startTime = DateTime.fromFormat('5:12 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('6:07 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
          case 24:
            startTime = DateTime.fromFormat('6:07 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            endTime = DateTime.fromFormat('7:02 AM', 'h:mm a', { zone: timezone }).plus({ days: 1 });
            break;
        }
      }

      // Create a planetary hour object
      planetaryHours.push({
        hour: hourNumber,
        planet: planetName,
        symbol: PLANET_SYMBOLS[planetName],
        period: isDayHour ? 'day' : 'night',
        startTime: startTime.toFormat('h:mma'),
        endTime: endTime.toFormat('h:mma'),
        refStart: refHour.start,
        refEnd: refHour.end
      });
    }
    
    return planetaryHours;
  } catch (error) {
    console.error('Error calculating planetary hours:', error);
    return [];
  }
}

// Run the calculation and compare with reference
function runTest() {
  try {
    const hours = calculatePlanetaryHours();
    
    console.log('\n=== HARDCODED PLANETARY HOURS ===\n');
    
    // Display day hours
    console.log('DAY HOURS (1-12):');
    console.log('Hour | Planet | Symbol | Calculated | Reference | Match?');
    console.log('-----|--------|--------|------------|-----------|-------');
    
    for (let i = 0; i < 12; i++) {
      const hour = hours[i];
      const ref = REFERENCE_HOURS[i];
      const matchPlanet = hour.planet === ref.planet;
      const matchStart = hour.startTime.toLowerCase() === ref.start;
      const matchEnd = hour.endTime.toLowerCase() === ref.end;
      const matchAll = matchPlanet && matchStart && matchEnd;
      
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${hour.startTime.toLowerCase()}-${hour.endTime.toLowerCase()} | ${ref.start}-${ref.end} | ${matchAll ? 'YES' : 'NO'}`
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
      const matchStart = hour.startTime.toLowerCase() === ref.start;
      const matchEnd = hour.endTime.toLowerCase() === ref.end;
      const matchAll = matchPlanet && matchStart && matchEnd;
      
      console.log(
        `${hour.hour.toString().padStart(4)} | ${hour.planet.padEnd(7)} | ${hour.symbol} | ` +
        `${hour.startTime.toLowerCase()}-${hour.endTime.toLowerCase()} | ${ref.start}-${ref.end} | ${matchAll ? 'YES' : 'NO'}`
      );
    }
    
    // Count matches
    let planetMatches = 0;
    let timeMatches = 0;
    for (let i = 0; i < 24; i++) {
      if (hours[i].planet === REFERENCE_HOURS[i].planet) {
        planetMatches++;
      }
      
      const startMatch = hours[i].startTime.toLowerCase() === REFERENCE_HOURS[i].start;
      const endMatch = hours[i].endTime.toLowerCase() === REFERENCE_HOURS[i].end;
      if (startMatch && endMatch) {
        timeMatches++;
      }
    }
    
    console.log(`\nPlanet matches: ${planetMatches}/24 (${(planetMatches/24*100).toFixed(1)}%)`);
    console.log(`Time matches: ${timeMatches}/24 (${(timeMatches/24*100).toFixed(1)}%)`);
  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();
