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
const IS_PRODUCTION          = Deno.env.get("IS_PRODUCTION") === "true"

const DARAJA_BASE = IS_PRODUCTION
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke"

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

  if (req.method === "POST" && url.pathname.endsWith("/mpesa")) {
    try {
      const { action, amount, phoneNumber, orderId } = await req.json()

      if (action !== "stkpush") {
        return new Response(JSON.stringify({ error: "Invalid action" }), {
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
          Amount:            Math.ceil(amount),
          PartyA:            phoneNumber,
          PartyB:            DARAJA_SHORTCODE,
          PhoneNumber:       phoneNumber,
          CallBackURL:       DARAJA_CALLBACK_URL,
          AccountReference:  "THRIFTR",
          TransactionDesc:   `Order ${orderId}`,
        }),
      })

      const result = await res.json()

      if (result.CheckoutRequestID && orderId) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        await supabase
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
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  }

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
        const { data: order } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("daraja_checkout_request_id", CheckoutRequestID)
          .select("*, stores(phone)")
          .single()

        if (order) {
          await supabase
            .from("listings")
            .update({ status: "reserved" })
            .eq("id", order.listing_id)

          // 1. Notify Store Owner via SMS
          if (order.stores?.phone) {
             try {
                await fetch(`${SUPABASE_URL}/functions/v1/sms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
                    body: JSON.stringify({
                        to: order.stores.phone,
                        message: `THRIFTR: New order for ${order.listing_name}! KES ${order.total_amount} is held in escrow. Please prepare the item.`
                    })
                })
             } catch (smsErr) {
                 console.error("Failed to send SMS to owner:", smsErr)
             }
          }

          // 2. Trigger Uber Direct if applicable
          if (order.delivery_method === 'uber') {
             try {
                await fetch(`${SUPABASE_URL}/functions/v1/uber`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
                    body: JSON.stringify({ orderId: order.id })
                })
             } catch (uberErr) {
                 console.error("Failed to trigger Uber Direct:", uberErr)
             }
          }
        }
      } else {
        await supabase
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
