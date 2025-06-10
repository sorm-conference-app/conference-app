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

export const findConflicts = (events: Event[]) => {
  const conflictIds = new Set<number>();
  const items = [];

  for (const item of events) {
    if (conflictIds.has(item.id)) {
      continue;
    }

    const conflicts = events.filter(
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