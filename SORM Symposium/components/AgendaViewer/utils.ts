import type { Event } from '@/types/Events.types';

export type TimeConflict = {
  event1: Event;
  event2: Event;
  type: 'contained' | 'overlap';
};

function convert24HrTimeToSeconds(time: string): number {
  // Handle 24-hour format (HH:mm:ss or HH:mm)
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 3600 + (minutes || 0) * 60;
}

function convert12HrTimeToSeconds(time: string): number {
  // Only try to handle 12-hour format if it includes AM/PM
  if (time.includes("AM") || time.includes("PM")) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 3600 + minutes * 60;
  }

  // If no AM/PM, treat as 24-hour format
  return convert24HrTimeToSeconds(time);
}

/**
 * Determine if two time intervals conflict.
 * @param startTimeA Start time for first event.
 * @param endTimeA End time for first event.
 * @param startTimeB Start time for second event.
 * @param endTimeB End time for second event.
 * @returns
 */
export function areTimesConflicting(
  startTimeA: string,
  endTimeA: string,
  startTimeB: string,
  endTimeB: string
): boolean {
  const startA = convert24HrTimeToSeconds(startTimeA);
  const endA = convert24HrTimeToSeconds(endTimeA);
  const startB = convert24HrTimeToSeconds(startTimeB);
  const endB = convert24HrTimeToSeconds(endTimeB);

  return startA < endB && startB < endA;
}

export function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function removeSecondsFromTime(time: string): string {
  const parts = time.split(":");
  if (parts.length === 3) {
    // HH:mm:ss -> HH:mm
    return `${parts[0]}:${parts[1]}`;
  } else if (parts.length === 2) {
    // HH:mm -> HH:mm
    return time;
  }
  // If format is unexpected, return as is
  return time;
}

export function isTimeValid(time: string): boolean {
  // Remove seconds from time, if present
  time = removeSecondsFromTime(time);

  // Check for 12-hour format (e.g., "1:30 PM" or "11:45 AM")
  if (time.includes("AM") || time.includes("PM")) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes >= 60) {
      return false;
    }

    // Validate hours based on AM/PM
    if (modifier.toUpperCase() === "AM") {
      return hours >= 1 && hours <= 12;
    } else if (modifier.toUpperCase() === "PM") {
      return hours >= 1 && hours <= 12;
    }
    return false;
  }

  // Check for 24-hour format (e.g., "13:30" or "09:45")
  const [hours, minutes] = time.split(":").map(Number);
  return !isNaN(hours) && !isNaN(minutes) && 
         hours >= 0 && hours < 24 && 
         minutes >= 0 && minutes < 60;
}

export function isDateValid(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  return !isNaN(new Date(year, month - 1, day).getTime());
}

/**
 * Adds the current year to a date string that doesn't include a year.
 * @param dateString - Date string in MM-DD format
 * @returns Date string in YYYY-MM-DD format
 */
export function addCurrentYearToDate(dateString: string): string {
  const currentYear = new Date().getFullYear();
  const [month, day] = dateString.split('-');
  return `${currentYear}-${month}-${day}`;
} 

type EventsByDate = {
  [date: string]: Event[];
};
export function groupEventsByDate(events: Event[]): EventsByDate {
  return events.reduce((acc: EventsByDate, event) => {
    if (!acc[event.event_date]) {
      acc[event.event_date] = [];
    }
    acc[event.event_date].push(event);
    return acc;
  }, {});
}

export function sortEventsByLocation(events: Event[], col1Location: string, col2Location: string): Event[] {
  events.sort((a, b) => {
    // Events with COL_1_LOCATION go to left column (first)
    const aIsCol1 = a.location === col1Location;
    const bIsCol1 = b.location === col1Location;
    
    if (aIsCol1 && !bIsCol1) return -1;
    if (!aIsCol1 && bIsCol1) return 1;
    
    // Events with COL_2_LOCATION go to right column (last)
    const aIsCol2 = a.location === col2Location;
    const bIsCol2 = b.location === col2Location;
    
    if (aIsCol2 && !bIsCol2) return 1;
    if (!aIsCol2 && bIsCol2) return -1;
    
    // For events with same location priority, maintain original order
    return 0;
  });
  return events;
}

export const findConflicts = (events: Event[]) => {
  const conflictIds = new Set<number>();
  const items = [];

  // Sort events by start time, and for events with same start time, sort by duration (longer first)
  const sortedEvents = [...events].sort((a, b) => {
    const startTimeA = convert24HrTimeToSeconds(a.start_time);
    const startTimeB = convert24HrTimeToSeconds(b.start_time);
    
    if (startTimeA !== startTimeB) {
      return startTimeA - startTimeB;
    }
    
    // If start times are equal, sort by duration (longer first)
    const durationA = convert24HrTimeToSeconds(a.end_time) - startTimeA;
    const durationB = convert24HrTimeToSeconds(b.end_time) - startTimeB;
    return durationB - durationA;
  });

  for (const item of sortedEvents) {
    if (conflictIds.has(item.id)) {
      continue;
    }

    const conflicts = sortedEvents.filter(
      (conflictItem) =>
        conflictItem.id !== item.id &&
        areTimesConflicting(
          item.start_time,
          item.end_time,
          conflictItem.start_time,
          conflictItem.end_time
        )
    );

    items.push({
      ...item,
      conflictingItems: conflicts,
    });
    for (const conflictItem of conflicts) {
      conflictIds.add(conflictItem.id);
    }
  }

  return items;
};

export function formatConflictMessage(conflict: TimeConflict): string {
  const { event1, event2, type } = conflict;
  
  if (type === 'contained') {
    const container = event1.start_time <= event2.start_time ? event1 : event2;
    const contained = event1.start_time <= event2.start_time ? event2 : event1;
    return `${container.title} (${container.start_time}-${container.end_time}) contains ${contained.title} (${contained.start_time}-${contained.end_time})`;
  } else {
    return `${event1.title} (${event1.start_time}-${event1.end_time}) overlaps with ${event2.title} (${event2.start_time}-${event2.end_time})`;
  }
} 

export function calculateEventOffset(startTimeA: string, startTimeB: string): number {
  const startA = convert24HrTimeToSeconds(startTimeA);
  const startB = convert24HrTimeToSeconds(startTimeB);
  return Math.max(0, (startB - startA) * (65 / 1800)); // 130px per hour
}

export function calculateHeight(startTime: string, endTime: string): number {
  const duration = convert24HrTimeToSeconds(endTime) - convert24HrTimeToSeconds(startTime);
  const BASE_HEIGHT = 130;
  return Math.max(BASE_HEIGHT, BASE_HEIGHT / 3600 * duration);
}