import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/types/Events.types";

/**
 * Hook to fetch events from Supabase with real-time updates
 * @param options Optional parameters for filtering events
 * @returns Object containing events, loading state, error, and a refresh function
 */
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}): ReturnType<typeof useQuery<Event[]>> {
  throw new Error("Should not be called directly.");
} 