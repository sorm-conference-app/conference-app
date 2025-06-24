// @ts-nocheck - This is a Deno edge function, not a Node.js/TypeScript file
// Deno runtime provides different globals and APIs than standard TypeScript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase client for Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore - Deno serve function
serve(async (req) => {
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' }),
      { 
        status: 405,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
        } 
      }
    )
  }

  try {
    // Check if request has content
    const contentType = req.headers.get('content-type')
    console.log('Content-Type:', contentType)

    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
          } 
        }
      )
    }

    // Get email from request body
    const body = await req.json()
    console.log('Request body:', body)
    
    const { email } = body
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
          } 
        }
      )
    }
    
    console.log('Checking email:', email)
    
    // Check if environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('SUPABASE_URL available:', !!supabaseUrl)
    console.log('SERVICE_ROLE_KEY available:', !!serviceRoleKey)
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
          } 
        }
      )
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // Use admin API to check if user exists
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email.toLowerCase()}`
    })
    
    if (error) {
      console.error('Admin API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to check email', details: error.message }),
        { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
          } 
        }
      )
    }
    
    // Check if user exists in auth AND has admin role or is in contact_info table
    let isAdmin = false;
    if (data.users.length > 0) {
      const user = data.users[0];
      console.log('Found user in auth:', user.email, 'User ID:', user.id);
      
      // Check if user has admin role (you might need to adjust this based on your setup)
      if (user.user_metadata && user.user_metadata.role === 'admin') {
        isAdmin = true;
      } else {
        // Check if user exists in contact_info table (organizers table)
        const { data: contactData, error: contactError } = await supabaseAdmin
          .from('contact_info')
          .select('id')
          .eq('email', email.toLowerCase())
          .single();
        
        if (!contactError && contactData) {
          isAdmin = true;
          console.log('User found in contact_info table (organizer)');
        } else {
          console.log('User not found in contact_info table (not an organizer)');
        }
      }
    }
    
    const result = { isAdmin }
    console.log('Final result:', result)
    
    // Return result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
        } 
      }
    )
    
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, x-client-trace, apikey, x-supabase-auth',
        } 
      }
    )
  }
}) 