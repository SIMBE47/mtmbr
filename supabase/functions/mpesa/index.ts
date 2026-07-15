import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const DARAJA_CONSUMER_KEY    = Deno.env.get("DARAJA_CONSUMER_KEY")!
const DARAJA_CONSUMER_SECRET = Deno.env.get("DARAJA_CONSUMER_SECRET")!
const DARAJA_SHORTCODE       = Deno.env.get("DARAJA_SHORTCODE") || "174379"
const DARAJA_PASSKEY         = Deno.env.get("DARAJA_PASSKEY")!
const DARAJA_CALLBACK_URL    = Deno.env.get("DARAJA_CALLBACK_URL")!
const SUPABASE_URL           = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// Use sandbox in dev, production in live
const DARAJA_BASE = "https://sandbox.safaricom.co.ke"

async function getAccessToken(): Promise<string> {
  const credentials = btoa(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`)
  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` }
  })
  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // ── STK PUSH — called by frontend checkout ─────────────────────────────────
  if (req.method === "POST" && (url.pathname.endsWith("/mpesa") || url.pathname.endsWith("/mpesa/"))) {
    try {
      const authHeader = req.headers.get("Authorization")
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Verify user identity
      const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { action, orderId, phoneNumber } = await req.json()

      if (action !== "stkpush" || !orderId) {
        return new Response(JSON.stringify({ error: "Invalid action or missing orderId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Fetch order from DB using Service Role to verify ownership and amount
      // This prevents price manipulation from the client
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (order.buyer_id !== user.id) {
        return new Response(JSON.stringify({ error: "Unauthorized access to order" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (order.status !== "pending") {
        return new Response(JSON.stringify({ error: "Order is not in pending state" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const accessToken = await getAccessToken()
      const timestamp   = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
      const password    = btoa(`${DARAJA_SHORTCODE}${DARAJA_PASSKEY}${timestamp}`)

      const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: DARAJA_SHORTCODE,
          Password:          password,
          Timestamp:         timestamp,
          TransactionType:   "CustomerPayBillOnline",
          Amount:            Math.ceil(order.total_amount), // Use amount from database
          PartyA:            phoneNumber,
          PartyB:            DARAJA_SHORTCODE,
          PhoneNumber:       phoneNumber,
          CallBackURL:       DARAJA_CALLBACK_URL,
          AccountReference:  "THRIFTR",
          TransactionDesc:   `Order ${orderId}`,
        }),
      })

      const result = await res.json()

      if (result.CheckoutRequestID) {
        await supabaseAdmin
          .from("orders")
          .update({
            daraja_checkout_request_id: result.CheckoutRequestID,
            daraja_merchant_request_id: result.MerchantRequestID,
          })
          .eq("id", orderId)
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  }

  // ── CALLBACK — Safaricom calls this when payment is confirmed or fails ──────
  if (req.method === "POST" && url.pathname.endsWith("/callback")) {
    try {
      const body          = await req.json()
      const stkCallback   = body?.Body?.stkCallback

      if (!stkCallback) {
        return new Response("Invalid callback", { status: 400, headers: corsHeaders })
      }

      const { CheckoutRequestID, ResultCode } = stkCallback

      if (ResultCode === 0) {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .update({ status: "paid" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
          .select("id, listing_id")
          .single()

        if (order) {
          await supabaseAdmin
            .from("listings")
            .update({ status: "reserved" })
            .eq("id", order.listing_id)
        }
      } else {
        await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
      }

      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } catch (err) {
      console.error("M-Pesa callback error:", err)
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders })
})
