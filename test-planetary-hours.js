// Test script for planetary hours calculation
const { calculatePlanetaryHours } = require('./app/services/planetaryHours');

// Cedar City, UT coordinates
const latitude = 37.6775; 
const longitude = -113.0619;

// Current date
const date = new Date();
console.log(`Testing planetary hours for Cedar City, UT on ${date.toLocaleDateString()}`);

// Run the calculation
async function runTest() {
  try {
    const hours = await calculatePlanetaryHours(latitude, longitude, date, 'America/Denver');
    
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
