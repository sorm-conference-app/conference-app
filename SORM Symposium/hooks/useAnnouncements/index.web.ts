import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type Announcement = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  type: string;
};

/**
 * Hook to fetch announcements from Supabase with real-time updates
 * @param limit Optional limit for number of announcements to fetch
 * @returns Object containing announcements, loading state, error, and a refresh function
 */
export default function useAnnouncements(limit?: number) {
  // Create a stable channel name using a ref
  const channelName = useRef(
    `announcements_changes_${Math.random().toString(36).substr(2, 9)}`,
  );
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  const queryKey = limit ? ["announcements", limit] : ["announcements"];

  const { refetch, ...rest } = useQuery<Announcement[]>({
    queryKey,
    queryFn: async function () {
      //console.log(
      //  `[${hookId.current}] Querying announcements with limit:`,
      //  limit,
      //);

      // On web, no filter by type because web doesn't receive push notifications
      // and wouldn't receive non-general announcements
      let query = supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      //console.log(`[${hookId.current}] Queried ${data.length} announcements`);
      return data as Announcement[];
    },
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription
  useEffect(() => {
    //console.log(
    //  `[${hookId.current}] Setting up real-time subscription with channel:`,
    //  channelName.current,
    //);

    // Subscribe to changes in the announcements table
    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "announcements",
        },
        (payload) => {
          //console.log(
          //  `[${hookId.current}] Real-time update received:`,
          //  payload,
          //);

          // Refresh the announcements when a change occurs
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
