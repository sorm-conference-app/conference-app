import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import type { Attendee } from "@/services/attendees";
import { getAttendeeByEmail, getAttendeeByPhone } from "@/services/attendees";
import { useEffect, useState } from "react";

/**
 * Hook to get the current attendee's information based on authenticated session
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

      let attendeeData: Attendee | null = null;

      if (session?.user) {
        // Get attendee info based on authenticated user's email or phone
        if (session.user.email) {
          attendeeData = await getAttendeeByEmail(session.user.email);
        } else if (session.user.phone) {
          attendeeData = await getAttendeeByPhone(session.user.phone);
        }
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