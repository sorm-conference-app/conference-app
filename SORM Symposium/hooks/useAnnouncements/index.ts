import { useQuery } from "@tanstack/react-query";

export type Announcement = {
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
export default function useAnnouncements(limit?: number): ReturnType<typeof useQuery<Announcement[]>> {
  throw new Error("Should not be called directly.");
}