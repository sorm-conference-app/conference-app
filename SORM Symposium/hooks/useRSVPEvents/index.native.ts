import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useCacheDatabase from "../useCacheDatabase";
import { event_attendees, events } from "@/db/schema";
import type { Event } from "@/types/Events.types";
import { sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";

/**
 * Hook to fetch RSVPed events for a specific device/user
 * @param deviceId The device ID to get RSVPed events for
 * @returns Object containing RSVPed events, loading state, error, and a refresh function
 */
export default function useRSVPEvents(deviceId: string) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `rsvp_events_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);
  const cache = useCacheDatabase();

  const queryKey = ["rsvp_events", deviceId];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      console.log(
        `[${hookId.current}] Querying RSVPed events for device:`,
        deviceId,
      );

      // First, get the event IDs that the user has RSVPed for
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("attendee_device_id", deviceId)

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

      // Cache the RSVP data
      const rsvpInsertData = rsvpData.map((item) => ({
        ...item,
        rsvp_at: new Date(item.rsvp_at), // Convert rsvp_at to Date object for SQLite
        notified: item.notified ? 1 : 0, // Convert boolean to integer for SQLite
      }));

      await cache
        .insert(event_attendees)
        .values(rsvpInsertData)
        .onConflictDoUpdate({
          target: event_attendees.id,
          set: {
            event_id: sql`excluded.event_id`,
            attendee_device_id: sql`excluded.attendee_device_id`,
            rsvp_at: sql`excluded.rsvp_at`,
            notified: sql`excluded.notified`,
          },
        });

      // Cache the events data
      const eventsInsertData = eventsData.map((item) => ({
        ...item,
        created_at: new Date(item.created_at), // Convert created_at to Date object for SQLite
        is_deleted: item.is_deleted ? 1 : 0, // Convert boolean to integer for SQLite
      }));

      await cache
        .insert(events)
        .values(eventsInsertData)
        .onConflictDoUpdate({
          target: events.id,
                     set: {
             title: sql`excluded.title`,
             description: sql`excluded.description`,
             event_date: sql`excluded.event_date`,
             start_time: sql`excluded.start_time`,
             end_time: sql`excluded.end_time`,
             location: sql`excluded.location`,
             speaker_name: sql`excluded.speaker_name`,
             speaker_title: sql`excluded.speaker_title`,
             speaker_email: sql`excluded.speaker_email`,
             topic: sql`excluded.topic`,
             slides_url: sql`excluded.slides_url`,
             is_deleted: sql`excluded.is_deleted`,
           },
        });

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