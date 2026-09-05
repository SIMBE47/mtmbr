## 2026-07-12 - Payment Edge Function Price Tampering & Unauthenticated Execution

**Vulnerability:** The M-Pesa STK push Edge Function (`supabase/functions/mpesa/index.ts`) accepted payment amounts directly from the client request body and did not verify user JWT authentication or order ownership. An attacker could trigger payment requests with arbitrary amounts or for orders belonging to other users.

**Learning:** In Supabase Edge Functions handling payment or sensitive operations, client requests must be authenticated using `supabase.auth.getUser()` via the `Authorization` header. Financial details like order amounts must always be retrieved from the database on the server side using the service role client rather than relying on parameters supplied in the request body.

**Prevention:** Always validate JWTs in Edge Functions and treat client-provided parameters (especially amounts, roles, and status flags) as untrusted. Retrieve authoritative values directly from the database.
