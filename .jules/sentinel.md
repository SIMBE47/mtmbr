## 2026-06-24 - [CRITICAL] M-Pesa Price Manipulation & Unauthorized Access

**Vulnerability:** The `mpesa` Edge Function accepted `amount` and `phoneNumber` directly from the request body without verifying the user's identity (JWT) or validating the data against the database. This allowed any user to trigger an STK push for any amount and any order, potentially leading to price manipulation or payment for other users' orders.

**Learning:** Supabase Edge Functions do not automatically enforce JWT verification or Row-Level Security (RLS) when invoked. They run with service role privileges if configured, or simply trust the client-provided data if not hardened. Relying on client-side data for financial transactions is a major security risk.

**Prevention:** Always verify the caller's identity using `supabase.auth.getUser(token)` in Edge Functions. Fetch sensitive transaction data (like prices and IDs) directly from the database using a service role client to ensure it matches the authoritative state and the authenticated user's permissions.
