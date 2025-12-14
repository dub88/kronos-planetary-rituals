import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { PlanetaryHour, PlanetDay as PlanetDayType } from '@/types';

export interface PlanetaryDayEvent {
  planet: {
    id: PlanetDayType;
    name: string;
  };
  date: string;
}

/**
 * Request permission to access the device calendar
 * @returns Promise<boolean> - True if permission is granted
 */
export const requestCalendarPermission = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

/**
 * Get the default calendar for the device
 * @returns Promise<string> - Calendar ID
 */
export const getDefaultCalendarId = async (): Promise<string> => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  
  const defaultCalendar = calendars.find(calendar => 
    Platform.OS === 'ios' 
      ? calendar.source.name === 'Default' && calendar.allowsModifications
      : calendar.accessLevel === Calendar.CalendarAccessLevel.OWNER && 
        calendar.allowsModifications
  );
  const fallbackCalendar = calendars.find(calendar => calendar.allowsModifications);
  if (!defaultCalendar && !fallbackCalendar) {
    throw new Error('No writable calendar found on device');
  }
  return (defaultCalendar || fallbackCalendar)?.id || '';
};

/**
 * Add a planetary day event to the calendar
 * @param planetaryDay - The planetary day to add
 * @returns Promise<string> - Event ID
 */
export const addPlanetaryDayToCalendar = async (
  planetaryDay: PlanetaryDayEvent
): Promise<string> => {
  try {
    const calendarId = await getDefaultCalendarId();
    
    const startDate = new Date(planetaryDay.date);
    const endDate = new Date(planetaryDay.date);
    endDate.setDate(endDate.getDate() + 1); // End date is exclusive
    const eventDetails = {
      title: `${planetaryDay.planet.name} Day`,
      notes: `This is a ${planetaryDay.planet.name} day. Rituals and activities associated with ${planetaryDay.planet.name} are more effective today.`,
      startDate,
      endDate,
      allDay: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console.error('Error adding planetary day to calendar:', error);
    throw error;
  }
};

/**
 * Add a planetary hour event to the calendar
 * @param planetaryHour - The planetary hour to add
 * @returns Promise<string> - Event ID
 */
export const addPlanetaryHourToCalendar = async (
  planetaryHour: PlanetaryHour
): Promise<string> => {
  try {
    const calendarId = await getDefaultCalendarId();
    
    const startDate = new Date(planetaryHour.startTime);
    const endDate = new Date(planetaryHour.endTime);
    const eventDetails = {
      title: `${planetaryHour.planet} Hour`,
      notes: `This is a ${planetaryHour.planet} hour. Rituals and activities associated with ${planetaryHour.planet} are more effective during this time.`,
      startDate,
      endDate,
      allDay: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console.error('Error adding planetary hour to calendar:', error);
    throw error;
  }
};
