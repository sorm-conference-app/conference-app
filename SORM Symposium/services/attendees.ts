import { supabase } from '@/constants/supabase';

export interface Attendee {
  id: number;
  created_at: string;
  email: string;
  name: string | null;
  organization: string | null;
  title: string | null;
  additional_info: string | null;
}

/**
 * Check if an attendee exists in the database
 * @param email - The email to check
 * @returns The attendee object if found, null otherwise
 */
export async function getAttendeeByEmail(email: string): Promise<Attendee | null> {
  const { data, error } = await supabase
    .from('attendee_info')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching attendee by email:', error);
    throw error;
  }

  return data;
}

/**
 * Mark an attendee's email as verified
 * @param email - The email to verify
 * @returns The updated attendee object
 */
export async function verifyAttendeeEmail(email: string): Promise<Attendee> {
  const { data, error } = await supabase
    .from('attendee_info')
    .select()
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error verifying attendee email:', error);
    throw error;
  }

  return data;
}