import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const UBER_CLIENT_ID = Deno.env.get("UBER_CLIENT_ID")
const UBER_CLIENT_SECRET = Deno.env.get("UBER_CLIENT_SECRET")
const UBER_CUSTOMER_ID = Deno.env.get("UBER_CUSTOMER_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

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

  try {
    const { orderId } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, stores(name, phone)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) throw new Error("Order not found")

    if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET || !UBER_CUSTOMER_ID) {
        console.warn("Uber: Missing credentials. Logging delivery request instead.")
        await supabase.from('orders').update({
            uber_delivery_id: 'mock_uber_id_' + Date.now(),
            uber_tracking_url: 'https://uber.com/track/mock'
        }).eq('id', orderId)
        return new Response(JSON.stringify({ status: 'mock_created', orderId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const accessToken = await getUberToken()

    // Create Delivery
    const res = await fetch(`https://api.uber.com/v1/customers/${UBER_CUSTOMER_ID}/deliveries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pickup_address: order.pickup_address,
        pickup_name: order.stores?.name || order.store_name,
        pickup_phone_number: order.stores?.phone || '',
        dropoff_address: order.dropoff_address,
        dropoff_name: order.buyer_name || 'Customer',
        dropoff_phone_number: order.phone_number,
        manifest_items: [{
          name: order.listing_name,
          quantity: 1,
          price: order.total_amount
        }]
      })
    })

    const result = await res.json()

    if (result.id) {
        await supabase.from('orders').update({
            uber_delivery_id: result.id,
            uber_tracking_url: result.tracking_url
        }).eq('id', orderId)
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
