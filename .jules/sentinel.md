## 2026-07-01 - Edge Function Payment Manipulation
**Vulnerability:** The `mpesa` Edge Function was unauthenticated and trusted the `amount` passed in the request body from the frontend. An attacker could bypass the frontend and invoke the function directly with a manually crafted `amount` (e.g., KES 1) for any `orderId`.

**Learning:** Supabase Edge Functions do not automatically enforce JWT verification or Row-Level Security (RLS) when invoked via `supabase.functions.invoke`. They are essentially public HTTP endpoints unless explicitly hardened. Relying on client-side state for sensitive transactions like payments is a critical architectural gap.

**Prevention:** Always extract and verify the `Authorization` header JWT using `supabase.auth.getUser(token)` within the Edge Function. Use the `SUPABASE_SERVICE_ROLE_KEY` to fetch authoritative data (amounts, owner IDs) directly from the database to validate the request server-side.
