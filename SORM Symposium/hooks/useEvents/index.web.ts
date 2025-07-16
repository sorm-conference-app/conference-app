import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Event } from "@/types/Events.types";

/**
 * Hook to fetch events from Supabase with real-time updates
 * @param options Optional parameters for filtering events
 * @returns Object containing events, loading state, error, and a refresh function
 */
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `events_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  const queryKey = ["events", options?.date, options?.showDeleted];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      console.log(
        `[${hookId.current}] Querying events with options:`,
        options,
      );

      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (options?.date) {
        query = query.eq("event_date", options.date);
      }

      if (options?.showDeleted === false) {
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      console.log(`[${hookId.current}] Queried ${data.length} events`);
      return data as Event[];
    },
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log(
      `[${hookId.current}] Setting up real-time subscription with channel:`,
      channelName.current,
    );

    // Subscribe to changes in the events table
    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log(
            `[${hookId.current}] Real-time update received:`,
            payload,
          );

          // Refresh the events when a change occurs
          refetch();
        },
      )
      .subscribe((status) => {
        console.log(`[${hookId.current}] Subscription status:`, status);
      });

    // Cleanup function to remove subscription when component unmounts
    return () => {
      console.log(
        `[${hookId.current}] Cleaning up subscription:`,
        channelName.current,
      );
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { refetch, ...rest };
} 