import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useCacheDatabase from "../useCacheDatabase";
import { announcements } from "@/db/schema";

// Set to true to test cache-only mode (no network requests)
const CACHE_ONLY = false;

type Announcement = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

/**
 * Hook to fetch announcements from Supabase with real-time updates
 * @param limit Optional limit for number of announcements to fetch
 * @returns Object containing announcements, loading state, error, and a refresh function
 */
export default function useAnnouncements(limit?: number) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `test_announcements_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);
  const cache = useCacheDatabase();

  const queryKey = limit ? ["announcements", limit] : ["announcements"];

  const { refetch, ...rest } = useQuery<Announcement[]>({
    queryKey,
    queryFn: async function () {
      console.log(
        `[${hookId.current}] Querying announcements with limit:`,
        limit,
      );

      // Cache-only mode for testing
      if (CACHE_ONLY) {
        console.log(`[${hookId.current}] 🔄 Using cache-only mode for announcements`);
        try {
          let cachedAnnouncements = await cache.select().from(announcements);
          
          // Apply limit if specified
          if (limit) {
            cachedAnnouncements = cachedAnnouncements.slice(0, limit);
          }
          
          console.log(`[${hookId.current}] Retrieved ${cachedAnnouncements.length} announcements from cache`);
          
          // Convert cached data to match Announcement type
          return cachedAnnouncements.map(announcement => ({
            ...announcement,
            created_at: announcement.created_at.toISOString(), // Convert Date to string
          })) as Announcement[];
        } catch (cacheError) {
          console.warn(`[${hookId.current}] Failed to read from cache:`, cacheError);
          return [];
        }
      }

      let query = supabase
        .from("test_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const insertData = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at), // Convert created_at to Date object for SQLite
      }));

      // Insert the fetched data into the cache.
      // Note: Using onConflictDoNothing since we are not updating existing records.
      // However, if we plan to 'edit' announcements in the future, we should use onConflictDoUpdate.
      try {
        await cache
          .insert(announcements)
          .values(insertData)
          .onConflictDoNothing({ target: announcements.id });
      } catch (cacheError) {
        console.warn(`[${hookId.current}] Failed to cache announcements:`, cacheError);
        // Continue without caching - the data is still returned from Supabase
      }

      console.log(`[${hookId.current}] Queried ${data.length} announcements`);
      return data as Announcement[];
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

    // Subscribe to changes in the test_announcements table
    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "test_announcements",
        },
        (payload) => {
          console.log(
            `[${hookId.current}] Real-time update received:`,
            payload,
          );

          // Refresh the announcements when a change occurs
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
