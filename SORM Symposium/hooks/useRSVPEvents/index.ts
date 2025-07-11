import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/types/Events.types";

/**
 * Hook to fetch RSVPed events for a specific attendee
 * @param attendeeId The attendee ID to get RSVPed events for
 * @returns Object containing RSVPed events, loading state, error, and a refresh function
 */
export default function useRSVPEvents(attendeeId: number): ReturnType<typeof useQuery<Event[]>> {
  throw new Error("Should not be called directly.");
} 