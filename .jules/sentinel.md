## 2026-07-12 - Payment Parameter Tampering & Unauthenticated STK Push
**Vulnerability:** Unauthenticated access and client-controlled `amount` parameter in the `mpesa` Edge Function allowed arbitrary payment amounts and unauthorized STK push initiations for any order.
**Learning:** Client-supplied prices must never be trusted for payment gateway integrations. Supabase Edge Functions require explicit JWT validation via `supabase.auth.getUser(token)` and database authorization checks using the service role key to verify order ownership and fetch authentic order amounts.
**Prevention:** Always validate JWT headers in Edge Functions, fetch price/amount server-side from the database, verify order status and user ownership, and sanitize internal error stack traces before returning responses.
