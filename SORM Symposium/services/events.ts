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