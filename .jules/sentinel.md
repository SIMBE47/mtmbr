# Sentinel Security Journal

## 2026-07-12 - [CRITICAL] Payment Amount Manipulation & Unauthenticated Edge Functions
**Vulnerability:** Edge Functions (`mpesa`, `sms`, `uber`) lacked authentication, and the `mpesa` function trusted the payment `amount` provided by the client. An attacker could invoke the function directly with a lower amount or use the services without being logged in.
**Learning:** Supabase Edge Functions do not automatically enforce authentication. Sensitive operations, especially payments, must verify the user's JWT and re-validate transaction details (like price) against the database using a service role.
**Prevention:** Implement JWT verification using `supabase.auth.getUser()` and fetch the authoritative source of truth (e.g., order amount) from the database in the Edge Function.
