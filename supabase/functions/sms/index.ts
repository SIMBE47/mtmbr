import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const AT_USERNAME = Deno.env.get("AT_USERNAME")
const AT_API_KEY = Deno.env.get("AT_API_KEY")
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: corsHeaders })

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!)
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace(/^Bearer /i, ''))
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  try {
    const { to, message } = await req.json()
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": AT_API_KEY!
      },
      body: new URLSearchParams({ username: AT_USERNAME!, to, message })
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (err) {
    console.error('SMS error:', err)
    return new Response(JSON.stringify({ error: 'Error' }), { status: 500, headers: corsHeaders })
  }
})
