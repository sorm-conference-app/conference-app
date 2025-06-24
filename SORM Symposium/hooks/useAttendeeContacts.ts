import { useCallback, useEffect, useState } from "react";
import { Attendee, getAttendeeContactList } from "@/services/attendees";

/**
 * Hook to fetch attendee contact list from Supabase
 * @returns Object containing contacts, loading state, error, and a refresh function
 */
export function useAttendeeContacts() {
  const [contacts, setContacts] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contacts = await getAttendeeContactList();
      setContacts(contacts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const sortedContacts = contacts.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);

  return { contacts: sortedContacts, loading, error, refresh: fetchContacts };
} 