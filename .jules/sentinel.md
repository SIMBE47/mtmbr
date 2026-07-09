# Sentinel Security Journal

## 2026-07-06 - Hardened M-Pesa Edge Function against Price Manipulation
**Vulnerability:** The `mpesa` Edge Function's STK push implementation previously trusted the `amount` provided by the client in the request body. An attacker could intercept the request and change the amount to KES 1, potentially fulfilling high-value orders for almost nothing. Additionally, the endpoint lacked JWT verification, allowing anyone to trigger payment requests for any order ID.

**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. While Row-Level Security (RLS) protects the database, sensitive server-side logic (like payment integrations) must explicitly verify the user's identity and re-validate data against the database using a service role client to ensure integrity.

**Prevention:** Always verify the `Authorization` header JWT in Edge Functions. When processing payments or sensitive transactions, fetch the source-of-truth data (like prices or user IDs) directly from the database using the `SUPABASE_SERVICE_ROLE_KEY` instead of relying on client-provided values.
