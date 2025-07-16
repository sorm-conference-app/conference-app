import { useState, useEffect } from "react";
import { getAttendeeByEmail } from "@/services/attendees";
import { getVerifiedEmails } from "@/lib/attendeeStorage";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import type { Attendee } from "@/services/attendees";

/**
 * Hook to get the current attendee's information
 * @returns Object containing attendee data, loading state, and error
 */
export function useCurrentAttendee() {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const session = useSupabaseAuth();

  useEffect(() => {
    loadAttendeeInfo();
  }, [session]);

  async function loadAttendeeInfo() {
    try {
      setLoading(true);
      setError(null);

      const verifiedEmails = await getVerifiedEmails();
      const firstVerifiedEmail = verifiedEmails.length > 0 ? verifiedEmails[0] : null;
      
      let attendeeData: Attendee | null = null;

      // If we have a verified email, fetch the user's attendee info
      if (firstVerifiedEmail) {
        attendeeData = await getAttendeeByEmail(firstVerifiedEmail);
      } else if (session?.user?.email) {
        // If they're logged in as an admin, get their email from auth
        attendeeData = await getAttendeeByEmail(session.user.email);
      }

      setAttendee(attendeeData);
    } catch (err) {
      console.error('Error loading attendee info:', err);
      setError(err instanceof Error ? err : new Error('Failed to load attendee info'));
    } finally {
      setLoading(false);
    }
  }

  return {
    attendee,
    loading,
    error,
    refresh: loadAttendeeInfo
  };
} 