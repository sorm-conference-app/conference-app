// @ts-nocheck - This is a Deno edge function, not a Node.js/TypeScript file
// Deno runtime provides different globals and APIs than standard TypeScript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase client for Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore - Deno serve function
serve(async (req: any) => {
  try {
    // Get email from request body
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" } 
        }
      )
    }
    
    // Create admin client with service role key
    // @ts-ignore - Deno environment variables
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Use admin API to check if user exists
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email.toLowerCase()}`
    })
    
    if (error) {
      console.error('Admin API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to check email' }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" } 
        }
      )
    }
    
    // Return result
    return new Response(
      JSON.stringify({ 
        isAdmin: data.users.length > 0 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    )
  }
}) 