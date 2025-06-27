import { supabase } from '@/constants/supabase';

export interface Attendee {
  id: number;
  created_at: string;
  email: string;
  name: string | null;
  organization: string | null;
  title: string | null;
  additional_info: string | null;
  is_admin: boolean;
  share_info?: boolean;
  seen_share_info_popup?: boolean;
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
 * Check if an email is registered as an attendee
 * @param email - The email to check
 * @returns True if the email exists in attendee_info table and is_admin is false
 */
export async function isAttendeeEmail(email: string): Promise<boolean> {
  const attendee = await getAttendeeByEmail(email);
  return attendee !== null;
}

/**
 * Check if an email is registered as an admin
 * @param email - The email to check
 * @returns True if the email exists in attendee_info table and is_admin is true
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  const attendee = await getAttendeeByEmail(email);
  return attendee !== null && attendee.is_admin === true;
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

/**
 * Check if the contact sharing popup should be shown for an attendee
 * @param email - The email to check
 * @returns True if the popup should be shown (user hasn't seen it before)
 */
export async function shouldShowContactSharingPopup(email: string): Promise<boolean> {
  const attendee = await getAttendeeByEmail(email);
  if (!attendee) return false;
  
  // Show popup if they haven't seen it before (seen_share_info_popup is null or false)
  return !attendee.seen_share_info_popup;
}

export async function updateContactSharingPreferences(
  email: string,
  shareInfo: boolean,
  additionalInfo: string = ''
): Promise<Attendee> {
  // Log values for debugging
  console.log('Updating contact sharing preferences for:', email, 'shareInfo:', shareInfo, 'additionalInfo:', additionalInfo);

  // Call the stored function to perform the update
  const { error } = await supabase.rpc('update_contact_sharing_preferences', {
    user_email: email,
    share_info_val: shareInfo,
    additional_info_val: additionalInfo,
    seen_popup_val: true
  });

  if (error) {
    console.error('Error updating contact sharing preferences:', error);
    throw error;
  }

  // Fetch and return the fresh row
  const updatedAttendee = await getAttendeeByEmail(email);
  return updatedAttendee as Attendee;
}

export async function getAttendeeContactList(): Promise<Attendee[]> {
  const { data, error } = await supabase
    .from('attendee_info')
    .select('*')
    .eq('share_info', true);

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data;
}