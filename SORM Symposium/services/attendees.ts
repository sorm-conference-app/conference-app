import { supabase } from '@/constants/supabase';

export interface Attendee {
  id: number;
  created_at: string;
  email: string | null;
  phone?: string | null; // Optional until DB is migrated
  name: string | null;
  organization: string | null;
  title: string | null;
  additional_info: string | null;
  is_admin: boolean;
  share_info?: boolean;
  seen_share_info_popup?: boolean;
}

/**
 * Check if an attendee exists in the database by email
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
 * Check if an attendee exists in the database by phone
 * @param phone - The phone number to check
 * @returns The attendee object if found, null otherwise
 */
export async function getAttendeeByPhone(phone: string): Promise<Attendee | null> {
  const { data, error } = await supabase
    .from('attendee_info')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching attendee by phone:', error);
    throw error;
  }

  return data;
}

/**
 * Check if an attendee exists in the database by email or phone
 * @param contact - The email or phone to check
 * @returns The attendee object if found, null otherwise
 */
export async function getAttendeeByContact(contact: string): Promise<Attendee | null> {
  // Determine if input is email or phone
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  
  if (isEmail) {
    return getAttendeeByEmail(contact);
  } else {
    return getAttendeeByPhone(contact);
  }
}

/**
 * Check if an email is registered as an attendee
 * @param email - The email to check
 * @returns True if the email exists in attendee_info table
 */
export async function isAttendeeEmail(email: string): Promise<boolean> {
  const attendee = await getAttendeeByEmail(email);
  return attendee !== null;
}

/**
 * Check if a phone number is registered as an attendee
 * @param phone - The phone number to check
 * @returns True if the phone exists in attendee_info table
 */
export async function isAttendeePhone(phone: string): Promise<boolean> {
  const attendee = await getAttendeeByPhone(phone);
  return attendee !== null;
}

/**
 * Check if an email or phone is registered as an attendee
 * @param contact - The email or phone to check
 * @returns True if the contact exists in attendee_info table
 */
export async function isAttendeeContact(contact: string): Promise<boolean> {
  const attendee = await getAttendeeByContact(contact);
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
 * Get an attendee by their contact info (email or phone)
 * @param contact - The email or phone to verify
 * @returns The attendee object
 */
export async function verifyAttendeeContact(contact: string): Promise<Attendee> {
  const attendee = await getAttendeeByContact(contact);
  if (!attendee) {
    throw new Error('Attendee not found');
  }
  return attendee;
}

/**
 * Check if the contact sharing popup should be shown for an attendee
 * @param contact - The email or phone to check
 * @returns True if the popup should be shown (user hasn't seen it before)
 */
export async function shouldShowContactSharingPopup(contact: string): Promise<boolean> {
  const attendee = await getAttendeeByContact(contact);
  if (!attendee) return false;
  
  // Show popup if they haven't seen it before (seen_share_info_popup is null or false)
  return !attendee.seen_share_info_popup;
}

export async function updateContactSharingPreferences(
  contact: string,
  shareInfo: boolean,
  additionalInfo: string = '',
  name?: string,
  organization?: string,
  title?: string
): Promise<Attendee> {
  // Log values for debugging
  console.log('Updating contact sharing info for:', contact, 'shareInfo:', shareInfo, 'additionalInfo:', additionalInfo);

  // Determine if contact is email or phone
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);

  // Prepare parameters based on contact type
  const rpcParams = {
    user_email: isEmail ? contact : null,
    user_phone: isEmail ? null : contact,
    share_info_val: shareInfo,
    name_val: name || null,
    organization_val: organization || null,
    title_val: title || null,
    additional_info_val: additionalInfo,
    seen_popup_val: true
  };
  
  const { error } = await supabase.rpc('update_contact_sharing_info', rpcParams);

  if (error) {
    console.error('Error updating contact sharing info:', error);
    throw error;
  }

  // Fetch and return the fresh row
  const updatedAttendee = await getAttendeeByContact(contact);
  if (!updatedAttendee) {
    throw new Error('Failed to fetch updated attendee');
  }
  return updatedAttendee;
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