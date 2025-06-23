export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  topic?: string | null;
}

export interface TimeConflict {
  event1: Event;
  event2: Event;
  type: 'overlap' | 'contained';
} 