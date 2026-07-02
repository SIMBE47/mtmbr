# Sentinel Security Journal

## 2026-07-01 - Harden M-Pesa Edge Function
**Vulnerability:** The `mpesa` Edge Function was unauthenticated and relied on the client-provided `amount` to initiate STK Push requests. This allowed any user (or unauthenticated attacker) to trigger payments for any order with an arbitrary amount, leading to potential price manipulation and API abuse.

**Learning:** Supabase Edge Functions do not automatically enforce authentication or validate that a user owns the data they are attempting to modify. Relying on frontend-provided data for financial transactions is a critical risk.

**Prevention:** Always verify the user's JWT via the `Authorization` header using `supabase.auth.getUser(token)`. Fetch authoritative transaction data (like amounts) directly from the database using a Service Role client to bypass RLS and ensure data integrity.
