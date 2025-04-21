// Final test script to match the reference planetary hours exactly
const { DateTime } = require('luxon');

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

// Calculate planetary hours based on the reference image
function calculateReferenceMatchHours() {
  try {
    // Hard-coded values from the reference image
    const sunriseTime = DateTime.fromFormat('7:03 AM', 'h:mm a', { zone: 'America/Denver' });
    const sunsetTime = DateTime.fromFormat('8:05 PM', 'h:mm a', { zone: 'America/Denver' });
    const nextSunriseTime = DateTime.fromFormat('7:02 AM', 'h:mm a', { zone: 'America/Denver' }).plus({ days: 1 });
    
    console.log('Reference Sunrise Today:', sunriseTime.toFormat('h:mm a'));
    console.log('Reference Sunset Today:', sunsetTime.toFormat('h:mm a'));
    console.log('Reference Sunrise Tomorrow:', nextSunriseTime.toFormat('h:mm a'));

    // Calculate durations
    const dayDuration = Math.abs(sunsetTime.diff(sunriseTime, 'minutes').minutes);
    const nightDuration = Math.abs(nextSunriseTime.diff(sunsetTime, 'minutes').minutes);
    
    // Calculate hour durations
    const dayHourDuration = dayDuration / 12;
    const nightHourDuration = nightDuration / 12;
    
    console.log('Day Duration (hours):', (dayDuration / 60).toFixed(2));
    console.log('Night Duration (hours):', (nightDuration / 60).toFixed(2));
    console.log('Day Hour Duration (minutes):', dayHourDuration.toFixed(2));
    console.log('Night Hour Duration (minutes):', nightHourDuration.toFixed(2));

    // Get the day of week (0-6, where 0 is Sunday)
    const jsDate = date;
    const dayOfWeek = jsDate.getDay();
    
    // Get the ruling planet for this day
    const dayRuler = DAY_RULERS[dayOfWeek];
    
    console.log('Day of week:', jsDate.toLocaleDateString('en-US', { weekday: 'long' }), '(', dayOfWeek, ')');
    console.log('Day ruling planet:', dayRuler);

    // Hard-coded planetary hours from the reference
    const referenceHours = [
      // Day hours (1-12)
      { hour: 1, planet: 'venus', start: '7:03am', end: '8:08am' },
      { hour: 2, planet: 'mercury', start: '8:08am', end: '9:13am' },
      { hour: 3, planet: 'moon', start: '9:13am', end: '10:19am' },
      { hour: 4, planet: 'saturn', start: '10:19am', end: '11:24am' },
      { hour: 5, planet: 'jupiter', start: '11:24am', end: '12:29pm' },
      { hour: 6, planet: 'mars', start: '12:29pm', end: '1:34pm' },
      { hour: 7, planet: 'sun', start: '1:34pm', end: '2:39pm' },
      { hour: 8, planet: 'venus', start: '2:39pm', end: '3:44pm' },
      { hour: 9, planet: 'mercury', start: '3:44pm', end: '4:49pm' },
      { hour: 10, planet: 'moon', start: '4:49pm', end: '5:54pm' },
      { hour: 11, planet: 'saturn', start: '5:54pm', end: '6:59pm' },
      { hour: 12, planet: 'jupiter', start: '6:59pm', end: '8:05pm' },
      
      // Night hours (13-24)
      { hour: 13, planet: 'mars', start: '8:05pm', end: '8:59pm' },
      { hour: 14, planet: 'sun', start: '8:59pm', end: '9:54pm' },
      { hour: 15, planet: 'venus', start: '9:54pm', end: '10:49pm' },
      { hour: 16, planet: 'mercury', start: '10:49pm', end: '11:44pm' },
      { hour: 17, planet: 'moon', start: '11:44pm', end: '12:38am' },
      { hour: 18, planet: 'saturn', start: '12:38am', end: '1:33am' },
      { hour: 19, planet: 'jupiter', start: '1:33am', end: '2:28am' },
      { hour: 20, planet: 'mars', start: '2:28am', end: '3:23am' },
      { hour: 21, planet: 'sun', start: '3:23am', end: '4:17am' },
      { hour: 22, planet: 'venus', start: '4:17am', end: '5:12am' },
      { hour: 23, planet: 'mercury', start: '5:12am', end: '6:07am' },
      { hour: 24, planet: 'moon', start: '6:07am', end: '7:02am' }
    ];
    
    // Calculate our own planetary hours based on the reference timing
    const planetaryHours = [];
    
    // Find the index of the day ruler in the planetary hour sequence
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
    
    // Calculate the 24 planetary hours
    for (let hourNumber = 1; hourNumber <= 24; hourNumber++) {
      // Determine if this is a day hour (1-12) or night hour (13-24)
      const isDayHour = hourNumber <= 12;
      
      // Calculate the position in the planetary sequence
      let hourOffset = hourNumber - 1; // 0-based index
      const sequencePosition = (dayRulerIndex + hourOffset) % 7;
      const planetName = PLANETARY_HOUR_SEQUENCE[sequencePosition];
      
      // Get the reference hour
      const refHour = referenceHours[hourNumber - 1];
      
      // Create a planetary hour object
      planetaryHours.push({
        hour: hourNumber,
        hourNumber: hourNumber,
        planet: planetName,
        planetSymbol: PLANET_SYMBOLS[planetName],
        period: isDayHour ? 'day' : 'night',
        isDay: isDayHour,
        refPlanet: refHour.planet,
        refPlanetSymbol: PLANET_SYMBOLS[refHour.planet],
        refStart: refHour.start,
        refEnd: refHour.end,
        match: planetName === refHour.planet
      });
    }
    
    return planetaryHours;
  } catch (error) {
    console.error('Error calculating planetary hours:', error);
    return [];
  }
}

// Run the calculation
function runTest() {
  try {
    const hours = calculateReferenceMatchHours();
    
    console.log('\n=== PLANETARY HOURS COMPARISON ===\n');
    
    // Display day hours
    console.log('DAY HOURS (1-12):');
    console.log('Hour | Our Planet | Ref Planet | Ref Times | Match?');
    console.log('-----|------------|------------|-----------|-------');
    
    for (let i = 0; i < 12; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hourNumber.toString().padStart(4)} | ${hour.planet.padEnd(10)} | ` +
        `${hour.refPlanet.padEnd(10)} | ${hour.refStart} - ${hour.refEnd} | ${hour.match ? 'YES' : 'NO'}`
      );
    }
    
    // Display night hours
    console.log('\nNIGHT HOURS (13-24):');
    console.log('Hour | Our Planet | Ref Planet | Ref Times | Match?');
    console.log('-----|------------|------------|-----------|-------');
    
    for (let i = 12; i < 24; i++) {
      const hour = hours[i];
      console.log(
        `${hour.hourNumber.toString().padStart(4)} | ${hour.planet.padEnd(10)} | ` +
        `${hour.refPlanet.padEnd(10)} | ${hour.refStart} - ${hour.refEnd} | ${hour.match ? 'YES' : 'NO'}`
      );
    }
    
    // Count matches
    const matches = hours.filter(h => h.match).length;
    console.log(`\nMatches: ${matches}/24 (${(matches/24*100).toFixed(1)}%)`);
    
    // Analyze the sequence
    console.log('\nAnalyzing planetary hour sequence:');
    
    // Check if the reference follows Chaldean order
    let isChaldeanOrder = true;
    for (let i = 1; i < hours.length; i++) {
      const prevPlanetIndex = PLANETARY_HOUR_SEQUENCE.indexOf(hours[i-1].refPlanet);
      const currPlanetIndex = PLANETARY_HOUR_SEQUENCE.indexOf(hours[i].refPlanet);
      
      if ((prevPlanetIndex + 1) % 7 !== currPlanetIndex) {
        isChaldeanOrder = false;
        break;
      }
    }
    
    console.log(`Reference follows Chaldean order: ${isChaldeanOrder ? 'YES' : 'NO'}`);
    
    // Check if day ruler is correct
    const refDayRuler = hours[0].refPlanet;
    const expectedDayRuler = DAY_RULERS[date.getDay()];
    console.log(`Reference day ruler (${refDayRuler}) matches expected day ruler (${expectedDayRuler}): ${refDayRuler === expectedDayRuler ? 'YES' : 'NO'}`);
    
    // Check if the first hour is ruled by the day ruler
    console.log(`First hour is ruled by the day ruler: ${hours[0].refPlanet === expectedDayRuler ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();
