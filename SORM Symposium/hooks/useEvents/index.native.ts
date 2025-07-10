import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useCacheDatabase from "../useCacheDatabase";
import { events } from "@/db/schema";
import type { Event } from "@/types/Events.types";
import { sql } from "drizzle-orm";

// Set to true to test cache-only mode (no network requests)
const CACHE_ONLY = false;

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
  const cache = useCacheDatabase();

  const queryKey = ["events", options?.date, options?.showDeleted];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      console.log(
        `[${hookId.current}] Querying events with options:`,
        options,
      );

      // Cache-only mode for testing
      if (CACHE_ONLY) {
        console.log(`[${hookId.current}] 🔄 Using cache-only mode`);
        try {
          const cachedEvents = await cache.select().from(events);
          console.log(`[${hookId.current}] Retrieved ${cachedEvents.length} events from cache`);
          // Convert cached data to match Event type
          return cachedEvents.map(event => ({
            ...event,
            created_at: event.created_at.toISOString(), // Convert Date to string
            is_deleted: Boolean(event.is_deleted), // Convert number to boolean
          })) as Event[];
        } catch (cacheError) {
          console.warn(`[${hookId.current}] Failed to read from cache:`, cacheError);
          return [];
        }
      }

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

      const insertData = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at), // Convert created_at to Date object for SQLite
        is_deleted: item.is_deleted ? 1 : 0, // Convert boolean to integer for SQLite
      }));

      // Insert the fetched data into the cache
      try {
        await cache
          .insert(events)
          .values(insertData)
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
      } catch (cacheError) {
        console.warn(`[${hookId.current}] Failed to cache events:`, cacheError);
        // Continue without caching - the data is still returned from Supabase
      }

      console.log(`[${hookId.current}] Queried ${data.length} events`);
      return data as Event[];
    },
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription (only if not in cache-only mode)
  useEffect(() => {
    if (CACHE_ONLY) {
      console.log(`[${hookId.current}] Skipping real-time subscription in cache-only mode`);
      return;
    }

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