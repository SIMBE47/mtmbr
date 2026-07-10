## 2026-07-09 - Hardening M-Pesa Edge Function
**Vulnerability:** Price manipulation and unauthorized payment initiation in Supabase Edge Functions.
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification or authorize the caller. Trusting client-side `amount` for financial transactions allowed arbitrary price setting.
**Prevention:** Always verify the `Authorization` header JWT using `supabase.auth.getUser()`, validate ownership/status of resources, and fetch sensitive transaction data (like `total_amount`) directly from the database using the `service_role` client.
