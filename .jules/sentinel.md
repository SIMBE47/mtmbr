# Sentinel Security Journal

## 2026-07-12 - Prevent M-Pesa Price Manipulation & Unauthenticated Abuse
**Vulnerability:** Unauthenticated invocation and client-side price manipulation in the M-Pesa STK Push Edge Function. An attacker could invoke the function directly to make payments for arbitrary orders with manipulated lower amounts (or completely free) by passing modified payloads without any JWT verification on the server side.
**Learning:** Edge Functions in Supabase are publicly accessible HTTP endpoints. If authorization headers are not explicitly validated, anyone can invoke them. Furthermore, trusting client-side payload parameters (like `amount`) for critical financial transactions without server-side validation against database records is a major business logic security gap.
**Prevention:** Always verify the caller's JWT using `supabase.auth.getUser(token)` within the Edge Function. Re-query the transaction amount directly from the database table (using the `SUPABASE_SERVICE_ROLE_KEY` client to bypass client RLS) and verify the order ownership and status before initiating any third-party payment requests.
