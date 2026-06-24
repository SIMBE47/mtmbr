## 2026-06-23 - Hardened M-Pesa Edge Function against Price Manipulation

**Vulnerability:** The `mpesa` Edge Function previously trusted the `amount` field sent by the client and lacked authentication/authorization. This allowed any user (or even unauthenticated actors) to trigger STK push requests for any order with an arbitrary amount, potentially leading to price manipulation or denial of service by spamming users with payment requests.

**Learning:** Trusting client-provided pricing data in payment functions is a critical architectural gap. Even if the frontend is secure, the backend endpoint must independently verify the source of truth (the database) using the authenticated user's context.

**Prevention:** Always verify the user's JWT in Edge Functions using `supabase.auth.getUser(token)`. Use the Supabase Service Role key to fetch sensitive transaction data (like order amounts) directly from the database and verify ownership before interacting with third-party payment APIs.
