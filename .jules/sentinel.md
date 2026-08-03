# Sentinel Security Journal

## 2026-07-12 - Secure JWT Verification in SMS Edge Function
**Vulnerability:** The standard SMS trigger Edge Function (`supabase/functions/sms/index.ts`) was entirely public and unauthenticated, allowing arbitrary external API consumers to invoke the endpoint, trigger SMS spam, and exhaust the developer's Africa's Talking API balance/quota.
**Learning:** When creating utility or notification functions (such as SMS triggers) in Supabase, developers often focus on the functionality and integration with third-party APIs (like Africa's Talking) without considering endpoint public accessibility. Since Supabase Edge Functions are public by default, explicit authentication verification checks on the user's session JWT must be implemented at the gateway or logic level.
**Prevention:** Implement explicit token verification checking on the `Authorization` header inside the edge function before performing any billing-sensitive actions. Verify user authentication status by querying `supabase.auth.getUser(token)` and returning a generic error on failure.
