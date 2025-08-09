import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import type { Attendee } from "@/services/attendees";
import { getAttendeeForSession } from "@/services/attendees";
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

  /**
   * Load attendee for the current authenticated session
   *
   * Uses a centralized resolver that prefers metadata email, then auth email, then phone
   */
  async function loadAttendeeInfo() {
    try {
      setLoading(true);
      setError(null);

      const attendeeData = await getAttendeeForSession(session);
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