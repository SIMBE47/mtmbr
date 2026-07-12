## 2026-07-11 - [CRITICAL] M-Pesa Price Manipulation & Broken Authentication
**Vulnerability:** The M-Pesa Edge Function trusted the `amount` and `orderId` provided by the client without verifying the user's identity or the actual order value in the database.
**Learning:** Supabase Edge Functions do not automatically enforce authentication or authorization; they require manual JWT verification using `supabase.auth.getUser()`. Trusting client-side input for financial transactions allows trivial price manipulation.
**Prevention:** Always fetch the source of truth (e.g., order amount) directly from the database using the Service Role after verifying the user's JWT and ownership of the record.
