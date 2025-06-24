import { supabase } from "@/constants/supabase";
import { getAttendeeByEmail, isAttendeeEmail, verifyAttendeeEmail } from "@/services/attendees";
import { isEmailVerifiedLocally, storeVerifiedEmail } from "@/lib/attendeeStorage";

/**
 * Check if an email is registered as an admin/organizer
 * @param email - The email to check
 * @returns True if the email exists in Supabase auth
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-admin-email', {
      body: { email: email.toLowerCase() }
    })
    
    if (error) {
      console.error('Edge function error:', error)
      return false
    }
    
    return data?.isAdmin === true
  } catch (error) {
    console.error('Error checking admin email:', error)
    return false
  }
}

/**
 * Sign in a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object returned by Supabase.
 */
export default async function signinUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    // Provide more specific error messages
    if (error.message.includes('Invalid login credentials')) {
      // Check if this email is actually registered as an admin
      const isAttendee = await isAttendeeEmail(email);
      if (isAttendee) {
        throw new Error("This email is registered as an attendee. Please use the 'Symposium Attendee' option instead.");
      } else {
        throw new Error("Incorrect password. Please check your password and try again.");
      }
    }
    throw error;
  }
  
  return data;
}

/**
 * Sign in an attendee with email verification.
 * @param email The attendee's email address.
 * @param callback Optional callback function.
 * @returns Object containing verification status and attendee info.
 */
export async function signinAttendee(email: string, dualRegistered: (() => void) | null = null) {
  // Check if email is already verified on this device
  const isLocallyVerified = await isEmailVerifiedLocally(email);
  
  if (isLocallyVerified) {
    // Email is already verified on this device, proceed directly
    return {
      verified: true,
      attendee: await getAttendeeByEmail(email),
      message: "Email already verified on this device"
    };
  }
  
  const isAdmin = await isAdminEmail(email);
  const isAttendee = await isAttendeeEmail(email);
  
  if (isAdmin && isAttendee) {
    dualRegistered?.();
    return {
      verified: false,
      attendee: null,
      message: "Email is registered as an organizer and an attendee."
    };
  }
  if (isAdmin) {
    throw new Error("This email is registered as an organizer. Please use the 'Symposium Organizer' option instead.");
  } 
  
  try {
    const verifiedAttendee = await verifyAttendeeEmail(email);
    await storeVerifiedEmail(email);
    return {
      verified: true,
      attendee: verifiedAttendee,
      message: "Email verified successfully"
    };
  } catch (error) {
    throw new Error(`Failed to verify email: ${(error as Error).message}`);
  }
}

/**
 * Verify an attendee's email address.
 * @param email The attendee's email address.
 * @returns The verified attendee object.
 */
export async function verifyAttendee(email: string) {
  // Verify in database
  const verifiedAttendee = await verifyAttendeeEmail(email);
  
  // Store verification locally
  await storeVerifiedEmail(email);
  
  return verifiedAttendee;
}