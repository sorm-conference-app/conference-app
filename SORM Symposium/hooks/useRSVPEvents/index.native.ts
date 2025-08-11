import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useCacheDatabase from "../useCacheDatabase";
import { event_attendees, events } from "@/db/schema";
import type { Event } from "@/types/Events.types";
import { sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";

// Set to true to test cache-only mode (no network requests)
const CACHE_ONLY = false;

/**
 * Hook to fetch RSVPed events for a specific attendee
 * @param attendeeId The attendee ID to get RSVPed events for
 * @returns Object containing RSVPed events, loading state, error, and a refresh function
 */
export default function useRSVPEvents(attendeeId: number) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `rsvp_events_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);
  const cache = useCacheDatabase();

  const queryKey = ["rsvp_events", attendeeId];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      //console.log(
      //  `[${hookId.current}] Querying RSVPed events for attendee:`,
      //  attendeeId,
      //);

      // Cache-only mode for testing
      if (CACHE_ONLY) {
        //console.log(`[${hookId.current}] 🔄 Using cache-only mode for RSVP events`);
        if (!cache) {
          //console.warn(`[${hookId.current}] Cache not available, returning empty array`);
          return [];
        }
        try {
          // Get RSVPed event IDs from cache
          const rsvpData = await cache
            .select()
            .from(event_attendees)
            .where(eq(event_attendees.attendee_id, attendeeId));
          
          if (rsvpData.length === 0) {
            //console.log(`[${hookId.current}] No RSVPed events found in cache`);
            return [];
          }

          const eventIds = rsvpData.map(item => item.event_id);
          
          // Get the full event details from cache
          const cachedEvents = await cache
            .select()
            .from(events)
            .where(eq(events.is_deleted, 0));
          
          // Filter to only RSVPed events
          const rsvpEvents = cachedEvents.filter(event => eventIds.includes(event.id));
          
          //console.log(`[${hookId.current}] Retrieved ${rsvpEvents.length} RSVPed events from cache`);
          
          // Convert cached data to match Event type
          return rsvpEvents.map(event => ({
            ...event,
            created_at: event.created_at.toISOString(), // Convert Date to string
            is_deleted: Boolean(event.is_deleted), // Convert number to boolean
            // Convert JSON strings back to arrays
            speaker_name: event.speaker_name ? JSON.parse(event.speaker_name) : null,
            speaker_title: event.speaker_title ? JSON.parse(event.speaker_title) : null,
            speaker_bio: event.speaker_bio ? JSON.parse(event.speaker_bio) : null,
            speaker_company: event.speaker_company ? JSON.parse(event.speaker_company) : null,
          })) as Event[];
        } catch (cacheError) {
          //console.warn(`[${hookId.current}] Failed to read from cache:`, cacheError);
          return [];
        }
      }

      // First, get the event IDs that the user has RSVPed for
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("attendee_id", attendeeId)

      if (rsvpError) {
        throw new Error(rsvpError.message);
      }

      if (!rsvpData || rsvpData.length === 0) {
        //console.log(`[${hookId.current}] No RSVPed events found`);
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

      if (cache) {
        try {
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
        } catch (cacheError) {
          console.warn(`[${hookId.current}] Failed to cache RSVP data:`, cacheError);
          // Continue without caching - the data is still returned from Supabase
        }
      }

      // Cache the events data
      const eventsInsertData = eventsData.map((item) => ({
        ...item,
        created_at: new Date(item.created_at), // Convert created_at to Date object for SQLite
        is_deleted: item.is_deleted ? 1 : 0, // Convert boolean to integer for SQLite
        // Convert arrays to JSON strings for SQLite storage
        speaker_name: item.speaker_name ? JSON.stringify(item.speaker_name) : null,
        speaker_title: item.speaker_title ? JSON.stringify(item.speaker_title) : null,
        speaker_bio: item.speaker_bio ? JSON.stringify(item.speaker_bio) : null,
        speaker_company: item.speaker_company ? JSON.stringify(item.speaker_company) : null,
      }));

      if (cache) {
        try {
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
             speaker_company: sql`excluded.speaker_company`,
             speaker_bio: sql`excluded.speaker_bio`,
             topic: sql`excluded.topic`,
             slides_url: sql`excluded.slides_url`,
             is_deleted: sql`excluded.is_deleted`,
           },
          });
        } catch (cacheError) {
          console.warn(`[${hookId.current}] Failed to cache events data:`, cacheError);
          // Continue without caching - the data is still returned from Supabase
        }
      }

      //console.log(`[${hookId.current}] Queried ${eventsData.length} RSVPed events`);
      return eventsData as Event[];
    },
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription for both events and event_attendees tables (only if not in cache-only mode)
  useEffect(() => {
    if (CACHE_ONLY) {
      //console.log(`[${hookId.current}] Skipping real-time subscription in cache-only mode`);
      return;
    }

    //console.log(
    //  `[${hookId.current}] Setting up real-time subscription with channel:`,
    //  channelName.current,
    //);

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
          //console.log(
          //  `[${hookId.current}] Real-time events update received:`,
          //  payload,
          //);

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
          //console.log(
          //  `[${hookId.current}] Real-time event_attendees update received:`,
          //  payload,
          //);

          // Refresh the RSVPed events when RSVP status changes
          refetch();
        },
      )
      .subscribe((status) => {
        //console.log(`[${hookId.current}] Subscription status:`, status);
      });

    // Cleanup function to remove subscription when component unmounts
    return () => {
      //console.log(
      //  `[${hookId.current}] Cleaning up subscription:`,
      //  channelName.current,
      //);
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { refetch, ...rest };
} 