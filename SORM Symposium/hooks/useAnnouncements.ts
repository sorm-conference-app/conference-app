import { supabase } from '@/constants/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

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
export function useAnnouncements(limit?: number) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Create a stable channel name using a ref
  const channelName = useRef(`test_announcements_changes_${Math.random().toString(36).substr(2, 9)}`);
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  // Memoize fetchAnnouncements to prevent unnecessary re-subscriptions
  const fetchAnnouncements = useCallback(async () => {
    try {
      console.log(`[${hookId.current}] Fetching announcements with limit:`, limit);
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('test_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert null titles to empty strings
      const formattedData = data.map(item => ({
        ...item,
        title: item.title || '',
      }));
      
      console.log(`[${hookId.current}] Fetched ${formattedData.length} announcements`);
      setAnnouncements(formattedData as Announcement[]);
    } catch (err) {
      console.error(`[${hookId.current}] Error fetching announcements:`, err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Set up real-time subscription
  useEffect(() => {
    console.log(`[${hookId.current}] Setting up real-time subscription with channel:`, channelName.current);
    fetchAnnouncements();

    // Subscribe to changes in the test_announcements table
    const channel = supabase
      .channel(channelName.current)
      .on('postgres_changes', 
        { 
          event: '*', // Listen to all events
          schema: 'public',
          table: 'test_announcements' 
        }, 
        (payload) => {
          console.log(`[${hookId.current}] Real-time update received:`, payload);
          
          // Refresh the announcements when a change occurs
          fetchAnnouncements();
        }
      )
      .subscribe((status) => {
        console.log(`[${hookId.current}] Subscription status:`, status);
      });
    
    // Cleanup function to remove subscription when component unmounts
    return () => {
      console.log(`[${hookId.current}] Cleaning up subscription:`, channelName.current);
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncements]);

  return { announcements, loading, error, refresh: fetchAnnouncements };
} 