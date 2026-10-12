## 2026-07-12 - M-Pesa Payment Amount Manipulation & Unauthenticated Edge Function

**Vulnerability:** The M-Pesa STK Push Edge Function accepted the `amount` directly from the client JSON body without authenticating the requesting user or verifying the order's actual amount in the database, allowing buyers to manipulate payment amounts.

**Learning:** `supabase.functions.invoke()` includes the client's JWT in the Authorization header by default, but Edge Functions do not automatically enforce authentication or validate payload parameters against the database unless explicitly implemented in the function logic.

**Prevention:** Always verify user JWTs in Edge Functions using `supabase.auth.getUser()` and fetch transaction totals directly from the database using service role credentials rather than trusting client-provided payment amounts.
