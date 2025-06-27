import { supabase } from "@/constants/supabase";
import { isAttendeeEmail, isAdminEmail, verifyAttendeeEmail } from "@/services/attendees";
import { isEmailVerifiedLocally, storeVerifiedEmail } from "@/lib/attendeeStorage";

/**
 * Check if an email is registered as an admin/organizer
 * @param email - The email to check
 * @returns True if the email exists in Supabase auth
 */
export async function isAdminEmailOld(email: string): Promise<boolean> {
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
 * Sign in an admin user.
 * @param email The admin's email.
 * @param password The admin's password.
 * @returns The user object returned by Supabase.
 */
export default async function signinAdmin(email: string, password: string) {
  const isAttendee = await isAttendeeEmail(email);
  if (!isAttendee) {
    throw new Error("This email is not registered. Please try a different email or contact a Symposium Organizer for a paper copy of the schedule.");
  }

  const isAdmin = await isAdminEmail(email);
  if (!isAdmin) {
    throw new Error("This email is registered as an attendee. Please go back and use the 'Symposium Attendee' option instead.");
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error("Incorrect password. Please check your password and try again.");
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
      attendee: null,
      message: "Email already verified on this device"
    };
  }
  
  const isAttendee = await isAttendeeEmail(email);
  if (!isAttendee) {
    throw new Error("This email is not registered. Please try a different email or contact a Symposium Organizer for a paper copy of the schedule.");
  }

  const isAdmin = await isAdminEmail(email);
  if (isAdmin) {
    if (dualRegistered) {
      dualRegistered?.();
      return {
        verified: false,
        attendee: null,
        message: "Email is registered as an organizer and an attendee."
      };
    }
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