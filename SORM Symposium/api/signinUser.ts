import { supabase } from "@/constants/supabase";
import { isAdminEmail, isAttendeeContact, isAttendeeEmail, verifyAttendeeContact } from "@/services/attendees";

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
 * Request OTP for email or phone
 * @param contact Email address or phone number
 * @returns Object with success status and message
 */
export async function requestOTP(contact: string) {
  // Validate that contact is registered
  const isRegistered = await isAttendeeContact(contact);
  if (!isRegistered) {
    throw new Error("This contact is not registered. Please try a different email/phone or contact a Symposium Organizer for a paper copy of the schedule.");
  }

  // Check if this is an admin (only for email)
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  if (isEmail) {
    const isAdmin = await isAdminEmail(contact);
    if (isAdmin) {
      throw new Error("This email is registered as an organizer. Please use the 'Symposium Organizer' option instead.");
    }
  }

  try {
    if (isEmail) {
      // Send email OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: contact,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: "myapp://auth-callback" // Configure this in your app
        }
      });
      
      if (error) {
        if (error.message.includes('User not found')) {
          throw new Error("Email not found in authentication system. Please contact a Symposium Organizer.");
        }
        throw error;
      }
      
      return {
        success: true,
        message: "Verification code sent to your email",
        method: "email" as const
      };
    } else {
      // Send phone OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: contact,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        if (error.message.includes('User not found')) {
          throw new Error("Phone number not found in authentication system. Please contact a Symposium Organizer.");
        }
        throw error;
      }
      
      return {
        success: true,
        message: "Verification code sent to your phone",
        method: "phone" as const
      };
    }
  } catch (error) {
    throw new Error(`Failed to send verification code: ${(error as Error).message}`);
  }
}

/**
 * Verify OTP code for email or phone
 * @param contact Email address or phone number
 * @param token OTP code
 * @returns Object with verification status and attendee info
 */
export async function verifyOTP(contact: string, token: string) {
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  
  try {
    let data, error;
    
    if (isEmail) {
      const result = await supabase.auth.verifyOtp({
        email: contact,
        token,
        type: 'email'
      });
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase.auth.verifyOtp({
        phone: contact,
        token,
        type: 'sms'
      });
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      if (error.message.includes('Token has expired')) {
        throw new Error("Verification code has expired. Please request a new one.");
      }
      if (error.message.includes('Invalid token')) {
        throw new Error("Invalid verification code. Please check and try again.");
      }
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Authentication failed. Please try again.");
    }
    
    // Verify the user exists in our attendee database
    const attendee = await verifyAttendeeContact(contact);
    
    return {
      verified: true,
      attendee,
      user: data.user,
      session: data.session,
      message: "Successfully authenticated"
    };
  } catch (error) {
    throw new Error(`Verification failed: ${(error as Error).message}`);
  }
}

/**
 * Legacy function - kept for backward compatibility
 * Use requestOTP and verifyOTP instead
 */
export async function signinAttendee(contact: string, dualRegistered: (() => void) | null = null) {
  // For backward compatibility, we'll just request OTP
  // The UI will need to handle the verification step separately
  await requestOTP(contact);
  
  return {
    verified: false,
    attendee: null,
    message: "Verification code sent. Please enter the code to continue."
  };
}

/**
 * Verify an attendee's contact (kept for backward compatibility)
 * @param contact The attendee's email or phone
 * @returns The verified attendee object
 */
export async function verifyAttendee(contact: string) {
  return await verifyAttendeeContact(contact);
}