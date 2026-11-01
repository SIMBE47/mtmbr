# Sentinel Security Journal

## 2026-07-12 - Payment Amount Manipulation and Missing Edge Function Authorization
**Vulnerability:** The `mpesa` Edge Function accepted payment requests without verifying user identity or validating the transaction amount against backend records. A malicious actor could invoke the STK push endpoint with arbitrary order IDs or tamper with the `amount` parameter (e.g., paying KES 1 for high-value orders), and internal error details were returned directly to the client.
**Learning:** Client-provided parameters should never be trusted as the source of truth for financial transactions. Supabase Edge Functions with CORS enabled can be called directly by external callers unless caller JWTs are validated and records are verified against database state using a service role client.
**Prevention:** Always authenticate the caller with `supabase.auth.getUser(token)`, retrieve authoritative order details and amounts directly from the database, ensure the authenticated user owns the order, verify status is `pending`, and return generic error messages for 500 errors to prevent leaking internal stack traces.
