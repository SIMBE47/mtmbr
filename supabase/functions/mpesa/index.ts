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
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // ── STK PUSH ─────────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname.endsWith("/mpesa")) {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "No authorization header" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      const token = authHeader.replace(/^Bearer /i, '').trim()
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      const { action, orderId, phoneNumber } = await req.json()
      if (action !== "stkpush") {
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      // Authoritative source for amount: the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .single()

      if (orderError || !order || order.status !== 'pending') {
        return new Response(JSON.stringify({ error: "Order not found or not pending" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      const accessToken = await getAccessToken()
      const timestamp   = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
      const password    = btoa(`${DARAJA_SHORTCODE}${DARAJA_PASSKEY}${timestamp}`)

      const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          BusinessShortCode: DARAJA_SHORTCODE,
          Password:          password,
          Timestamp:         timestamp,
          TransactionType:   "CustomerPayBillOnline",
          Amount:            Math.ceil(order.total_amount),
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
        await supabase
          .from("orders")
          .update({
            daraja_checkout_request_id: result.CheckoutRequestID,
            daraja_merchant_request_id: result.MerchantRequestID
          })
          .eq("id", orderId)
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    } catch (err) {
      console.error("M-Pesa STK Push error:", err)
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
  }

  // ── CALLBACK ─────────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname.endsWith("/callback")) {
    try {
      const body = await req.json()
      const stkCallback = body?.Body?.stkCallback
      if (!stkCallback) {
        return new Response("Invalid callback", { status: 400, headers: corsHeaders })
      }

      const { CheckoutRequestID, ResultCode } = stkCallback
      if (ResultCode === 0) {
        const { data: order } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
          .select("id, listing_id")
          .single()

        if (order) {
          await supabase
            .from("listings")
            .update({ status: "reserved" })
            .eq("id", order.listing_id)
        }
      } else {
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
      }

      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    } catch (err) {
      console.error("M-Pesa callback error:", err)
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders })
})
