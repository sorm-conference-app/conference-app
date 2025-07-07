import { useCallback, useEffect, useState, useRef } from "react";
import { Attendee, getAttendeeContactList } from "@/services/attendees";
import { supabase } from "@/constants/supabase";

/**
 * Hook to fetch attendee contact list from Supabase with real-time updates
 * @returns Object containing contacts, loading state, error, and a refresh function
 */
export function useAttendeeContacts() {
  const [contacts, setContacts] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a stable channel name using a ref
  const channelName = useRef(`attendee_contacts_changes_${Math.random().toString(36).substr(2, 9)}`);
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[${hookId.current}] Fetching attendee contacts`);
      const contacts = await getAttendeeContactList();
      console.log(`[${hookId.current}] Fetched ${contacts.length} contacts`);
      setContacts(contacts);
    } catch (err) {
      console.error(`[${hookId.current}] Error fetching contacts:`, err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    console.log(`[${hookId.current}] Setting up real-time subscription with channel:`, channelName.current);
    fetchContacts();

    // Subscribe to changes in the attendee_info table
    const channel = supabase
      .channel(channelName.current)
      .on('postgres_changes', 
        { 
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'attendee_info' 
        }, 
        (payload) => {
          console.log(`[${hookId.current}] Real-time update received:`, payload);
          
          // Refresh the contacts when a change occurs
          fetchContacts();
        }
      )
      .subscribe((status) => {
        console.log(`[${hookId.current}] Subscription status:`, status);
      });
    
    // Cleanup function to remove subscription when component unmounts
    return () => {
      console.log(`[${hookId.current}] Cleaning up subscription:`, channelName.current);
      supabase.removeChannel(channel);
    };
  }, [fetchContacts]);

  const sortedContacts = contacts.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);

  return { contacts: sortedContacts, loading, error, refresh: fetchContacts };
} 