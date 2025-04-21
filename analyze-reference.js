// Script to analyze the reference data and determine the correct pattern
const { DateTime } = require('luxon');

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

// Reference data from the image for November 4, 2025 (Tuesday)
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

function analyzeReferenceData() {
  console.log("Analyzing reference data for November 4, 2025 (Tuesday)");
  
  // Get the day of week (0-6, where 0 is Sunday)
  const date = new Date('2025-11-04T12:00:00');
  const dayOfWeek = date.getDay();
  const dayRuler = DAY_RULERS[dayOfWeek];
  
  console.log(`Day of week: ${date.toLocaleString('en-US', { weekday: 'long' })} (${dayOfWeek})`);
  console.log(`Day ruler: ${dayRuler} (${PLANET_SYMBOLS[dayRuler]})`);
  
  // Get the first hour planet from the reference
  const firstHourPlanet = REFERENCE_HOURS[0].planet;
  console.log(`First hour planet from reference: ${firstHourPlanet} (${PLANET_SYMBOLS[firstHourPlanet]})`);
  
  // Find the position of the day ruler in the Chaldean order
  const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
  console.log(`Day ruler index in Chaldean order: ${dayRulerIndex}`);
  
  // Find the position of the first hour planet in the Chaldean order
  const firstHourIndex = PLANETARY_HOUR_SEQUENCE.indexOf(firstHourPlanet);
  console.log(`First hour planet index in Chaldean order: ${firstHourIndex}`);
  
  // Calculate the offset from day ruler to first hour planet
  let offset = (firstHourIndex - dayRulerIndex + 7) % 7;
  console.log(`Offset from day ruler to first hour: ${offset}`);
  
  // Check if the sequence follows the Chaldean order
  console.log("\nVerifying if the sequence follows the Chaldean order:");
  let followsChaldeanOrder = true;
  for (let i = 0; i < 23; i++) {
    const currentPlanet = REFERENCE_HOURS[i].planet;
    const nextPlanet = REFERENCE_HOURS[i+1].planet;
    
    const currentIndex = PLANETARY_HOUR_SEQUENCE.indexOf(currentPlanet);
    const expectedNextIndex = (currentIndex + 1) % 7;
    const expectedNextPlanet = PLANETARY_HOUR_SEQUENCE[expectedNextIndex];
    
    const matches = nextPlanet === expectedNextPlanet;
    followsChaldeanOrder = followsChaldeanOrder && matches;
    
    if (i < 5) { // Just show the first few to keep output clean
      console.log(`Hour ${i+1} (${currentPlanet}) -> Hour ${i+2} (${nextPlanet}): Expected ${expectedNextPlanet} - ${matches ? 'MATCH' : 'NO MATCH'}`);
    }
  }
  
  console.log(`\nSequence follows Chaldean order: ${followsChaldeanOrder ? 'YES' : 'NO'}`);
  
  // Try to find a pattern for the first hour of each day
  console.log("\nTrying to find a pattern for the first hour of each day:");
  
  // Theory: The first hour of the day is the planet at position X in the Chaldean order
  // where X depends on the day of the week
  console.log("Theory: First hour is determined by a fixed offset from the day ruler");
  
  for (let i = 0; i < 7; i++) {
    const testOffset = i;
    const testFirstHourIndex = (dayRulerIndex + testOffset) % 7;
    const testFirstHourPlanet = PLANETARY_HOUR_SEQUENCE[testFirstHourIndex];
    const matches = testFirstHourPlanet === firstHourPlanet;
    
    console.log(`Offset ${testOffset}: ${dayRuler} -> ${testFirstHourPlanet} (${PLANET_SYMBOLS[testFirstHourPlanet]}) - ${matches ? 'MATCH' : 'NO MATCH'}`);
  }
  
  // Theory: The first hour of each day follows a specific sequence
  console.log("\nTheory: First hour of each day follows a specific sequence");
  
  // Let's check what the first hour would be for each day of the week
  // if we use the same offset we found for Tuesday
  console.log("\nPredicting first hour for each day of the week using offset:", offset);
  
  for (let dow = 0; dow < 7; dow++) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dow];
    const dayRuler = DAY_RULERS[dow];
    const dayRulerIndex = PLANETARY_HOUR_SEQUENCE.indexOf(dayRuler);
    const firstHourIndex = (dayRulerIndex + offset) % 7;
    const firstHourPlanet = PLANETARY_HOUR_SEQUENCE[firstHourIndex];
    
    console.log(`${dayName}: Day ruler = ${dayRuler} (${PLANET_SYMBOLS[dayRuler]}), First hour = ${firstHourPlanet} (${PLANET_SYMBOLS[firstHourPlanet]})`);
  }
  
  // Let's check the reverse - what if the first hour is always Venus?
  console.log("\nTheory: First hour is always Venus");
  const venusIndex = PLANETARY_HOUR_SEQUENCE.indexOf('venus');
  console.log(`Venus index in Chaldean order: ${venusIndex}`);
  
  // If first hour is always Venus, then the sequence would be:
  console.log("\nIf first hour is always Venus, the sequence would be:");
  for (let i = 0; i < 24; i++) {
    const hourIndex = (venusIndex + i) % 7;
    const hourPlanet = PLANETARY_HOUR_SEQUENCE[hourIndex];
    const refPlanet = REFERENCE_HOURS[i].planet;
    const matches = hourPlanet === refPlanet;
    
    if (i < 12) { // Just show the first 12 to keep output clean
      console.log(`Hour ${i+1}: ${hourPlanet} (${PLANET_SYMBOLS[hourPlanet]}) - Reference: ${refPlanet} (${PLANET_SYMBOLS[refPlanet]}) - ${matches ? 'MATCH' : 'NO MATCH'}`);
    }
  }
}

analyzeReferenceData();
