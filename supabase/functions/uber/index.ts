import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
})
