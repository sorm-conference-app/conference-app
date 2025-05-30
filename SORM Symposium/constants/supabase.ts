import type { Database } from "@/types/Supabase.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * The Supabase client instance for making API calls to your backend.
 *
 * @remarks
 * This client is safe to use on the client side as the anon key is public.
 */
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
