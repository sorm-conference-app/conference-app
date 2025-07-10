import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Event } from "@/types/Events.types";

/**
 * Hook to fetch RSVPed events for a specific device/user
 * @param deviceId The device ID to get RSVPed events for
 * @returns Object containing RSVPed events, loading state, error, and a refresh function
 */
export default function useRSVPEvents(attendeeId: number) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `rsvp_events_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  const queryKey = ["rsvp_events", attendeeId];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      console.log(
        `[${hookId.current}] Querying RSVPed events for attendee:`,
        attendeeId,
      );

      // First, get the event IDs that the user has RSVPed for
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("attendee_id", attendeeId)

      if (rsvpError) {
        throw new Error(rsvpError.message);
      }

      if (!rsvpData || rsvpData.length === 0) {
        console.log(`[${hookId.current}] No RSVPed events found`);
        return [];
      }

      const eventIds = rsvpData.map((item) => item.event_id);

      // Then, get the full event details for those events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .eq("is_deleted", false)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (eventsError) {
        throw new Error(eventsError.message);
      }

      console.log(`[${hookId.current}] Queried ${eventsData.length} RSVPed events`);
      return eventsData as Event[];
    },
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription for both events and event_attendees tables
  useEffect(() => {
    console.log(
      `[${hookId.current}] Setting up real-time subscription with channel:`,
      channelName.current,
    );

    // Subscribe to changes in both the events and event_attendees tables
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
            `[${hookId.current}] Real-time events update received:`,
            payload,
          );

          // Refresh the RSVPed events when events change
          refetch();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "event_attendees",
        },
        (payload) => {
          console.log(
            `[${hookId.current}] Real-time event_attendees update received:`,
            payload,
          );

          // Refresh the RSVPed events when RSVP status changes
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