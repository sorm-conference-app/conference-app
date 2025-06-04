import { Event, TimeConflict } from './types';

export function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function detectTimeConflicts(events: Event[]): TimeConflict[] {
  const conflicts: TimeConflict[] = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];

      const start1 = parseTime(event1.startTime);
      const end1 = parseTime(event1.endTime);
      const start2 = parseTime(event2.startTime);
      const end2 = parseTime(event2.endTime);

      // Check for overlap
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          event1,
          event2,
          type: start1 <= start2 && end1 >= end2 || start2 <= start1 && end2 >= end1
            ? 'contained'
            : 'overlap'
        });
      }
    }
  }

  return conflicts;
}

export function formatConflictMessage(conflict: TimeConflict): string {
  const { event1, event2, type } = conflict;
  
  if (type === 'contained') {
    const container = event1.startTime <= event2.startTime ? event1 : event2;
    const contained = event1.startTime <= event2.startTime ? event2 : event1;
    return `${container.title} (${container.startTime}-${container.endTime}) contains ${contained.title} (${contained.startTime}-${contained.endTime})`;
  } else {
    return `${event1.title} (${event1.startTime}-${event1.endTime}) overlaps with ${event2.title} (${event2.startTime}-${event2.endTime})`;
  }
} 