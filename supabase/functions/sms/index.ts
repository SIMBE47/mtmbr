import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const AT_USERNAME = Deno.env.get("AT_USERNAME")
const AT_API_KEY = Deno.env.get("AT_API_KEY")
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const { to, message } = await req.json()

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "apikey": AT_API_KEY!
    },
    body: new URLSearchParams({
      username: AT_USERNAME!,
      to: to,
      message: message
    })
  })

  const result = await res.json()
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
})
