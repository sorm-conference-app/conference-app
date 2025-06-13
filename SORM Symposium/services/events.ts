import { supabase } from '@/constants/supabase';
import type { Event } from '@/types/Events.types';

/**
 * Fetches all events from the database
 * @returns Array of events sorted by date and start time
 */
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data;
}

/**
 * Subscribes to real-time updates for the events table
 * @param callback - Function to call when events are updated
 * @returns Unsubscribe function
 */
export function subscribeToEvents(callback: (events: Event[]) => void) {
  // Initial fetch
  getAllEvents().then(callback);

  // Subscribe to real-time updates
  const subscription = supabase
    .channel('events_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'events'
      },
      async () => {
        // When any change occurs, fetch the latest events
        const events = await getAllEvents();
        callback(events);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Fetches events for a specific date
 * @param date - The date to fetch events for (YYYY-MM-DD format)
 * @returns Array of events for the specified date
 */
export async function getEventsByDate(date: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_date', date)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events by date:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches a single event by its ID
 * @param id - The event ID
 * @returns The event object or null if not found
 */
export async function getEventById(id: number): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned
      return null;
    }
    console.error('Error fetching event by id:', error);
    throw error;
  }

  return data;
}

/**
 * Creates a new event in the database
 * @param event - The event data to create
 * @returns The created event
 */
export async function createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
}

/**
 * Updates an existing event in the database
 * @param id - The ID of the event to update
 * @param event - The updated event data
 * @returns The updated event
 */
export async function updateEvent(id: number, event: Partial<Event>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

/**
 * Deletes an event from the database
 * @param id - The ID of the event to delete
 */
export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
} 