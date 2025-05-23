import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://izlxjqgiauljmlqtzrto.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bHhqcWdpYXVsam1scXR6cnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTMyNjgsImV4cCI6MjA2MzI2OTI2OH0.LK7OykPBKcgR5Hczk8nIY8Z6LVYgfOXWAV7RRGOZ4EI'

/**
 * The Supabase client instance for making API calls to your backend.
 *
 * @remarks
 * This client is safe to use on the client side as the anon key is public.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 