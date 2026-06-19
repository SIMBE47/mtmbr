## 2025-05-13 - Hardening M-Pesa Edge Function: JWT Verification & Price Validation

**Vulnerability:** The M-Pesa Edge Function was vulnerable to price manipulation by trusting the `amount` field provided in the client request. It also lacked JWT verification, potentially allowing unauthorized payment attempts.

**Learning:** When using Edge Functions for payments, the client's provided amount must never be trusted. Instead, use the Supabase Service Role client to fetch the transaction amount directly from the database based on a unique identifier (like an order ID). This ensures the "source of truth" is used for the payment provider's request.

**Prevention:**
1. Always verify the caller's identity via `supabase.auth.getUser()`.
2. Fetch sensitive data like payment amounts from the database using a service role client to bypass user RLS for validation purposes.
3. Validate ownership of the target resource (e.g., the order) before proceeding.
