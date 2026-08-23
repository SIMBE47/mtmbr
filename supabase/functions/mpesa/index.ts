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
// Change to "https://api.safaricom.co.ke" when you go live
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

  // ── STK PUSH — called by frontend checkout ─────────────────────────────────
  if (req.method === "POST" && (url.pathname.endsWith("/mpesa") || url.pathname.endsWith("/mpesa/"))) {
    try {
      // 🔒 SECURITY: Verify caller JWT token to prevent unauthorized access
      const authHeader = req.headers.get("Authorization")
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing authorization header" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const token = authHeader.replace(/^Bearer /i, "").trim()
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { action, phoneNumber, orderId } = await req.json()

      if (action !== "stkpush" || !orderId || !phoneNumber) {
        return new Response(JSON.stringify({ error: "Invalid request payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // 🔒 SECURITY: Retrieve authoritative order details & total amount from DB to prevent tampering
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id, buyer_id, total_amount, status")
        .eq("id", orderId)
        .single()

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (order.buyer_id !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden: You do not own this order" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (order.status !== "pending") {
        return new Response(JSON.stringify({ error: "Order is not in pending status" }), {
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

      // Store the checkout request ID on the order so we can match the callback
      if (result.CheckoutRequestID && orderId) {
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
      console.error("STK Push Error:", err)
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  }

  // ── CALLBACK — Safaricom calls this when payment is confirmed or fails ──────
  // URL: https://your-project.supabase.co/functions/v1/mpesa/callback
  if (req.method === "POST" && url.pathname.endsWith("/callback")) {
    try {
      const body          = await req.json()
      const stkCallback   = body?.Body?.stkCallback

      if (!stkCallback) {
        return new Response("Invalid callback", { status: 400, headers: corsHeaders })
      }

      const { CheckoutRequestID, ResultCode } = stkCallback
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      if (ResultCode === 0) {
        // ✅ Payment successful — update order to PAID, mark listing as sold
        const { data: order } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
          .select("id, listing_id, store_id, total_amount, buyer_id")
          .single()

        if (order) {
          // Mark listing as reserved so no one else can buy it
          await supabase
            .from("listings")
            .update({ status: "reserved" })
            .eq("id", order.listing_id)
        }
      } else {
        // ❌ Payment failed or cancelled — reset order to pending
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
      }

      // Always return 200 to Safaricom or they'll retry
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } catch (err) {
      console.error("M-Pesa callback error:", err)
      // Still return 200 — Safaricom retries on non-200 responses
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders })
})
