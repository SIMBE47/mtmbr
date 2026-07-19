import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const UBER_CLIENT_ID = Deno.env.get("UBER_CLIENT_ID")
const UBER_CLIENT_SECRET = Deno.env.get("UBER_CLIENT_SECRET")
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function getUberToken() {
  const res = await fetch("https://login.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: UBER_CLIENT_ID!,
      client_secret: UBER_CLIENT_SECRET!,
      grant_type: "client_credentials",
      scope: "delivery"
    })
  })
  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // 1. Verify authorization header exists explicitly to prevent runtime errors
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  // 2. Extract JWT token case-insensitively and trim
  const token = authHeader.replace(/^Bearer /i, "").trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 3. Authenticate user to protect third-party Uber API credits
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const { pickupAddress, dropoffAddress, itemDescription, itemValue } = await req.json()

    const accessToken = await getUberToken()

    const res = await fetch("https://api.uber.com/v1/eats/deliveries", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        manifest_items: [{
          name: itemDescription,
          quantity: 1,
          price: itemValue
        }]
      })
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (err) {
    console.error("Uber Edge Function error:", err)
    // Fail securely and return generic error message to prevent leaking stack traces or internal details
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
