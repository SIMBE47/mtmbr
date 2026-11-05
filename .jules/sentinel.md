## 2026-07-12 - M-Pesa STK Push Payment Tampering and Authentication Bypass
**Vulnerability:** The `mpesa` Edge Function accepted unauthenticated requests and trusted client-supplied payment amounts (`amount`) when initiating Daraja STK Push requests, while exposing internal exception details (`String(err)`) to clients.
**Learning:** Edge Functions acting as payment proxies must never trust client-provided amounts or IDs; orders must be looked up in the database using the service role client and matched against the authenticated user's JWT.
**Prevention:** Require caller JWT authentication with `supabase.auth.getUser()`, verify order ownership and `pending` status, use the authoritative database `total_amount`, and return generic error messages for 500 responses.
