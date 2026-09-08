# Sentinel Security Journal

## 2026-07-12 - Payment Amount Manipulation and Unauthenticated STK Push in M-Pesa Edge Function

**Vulnerability:** The M-Pesa Edge Function allowed unauthenticated users to trigger STK Push payment requests and accepted client-supplied payment amounts without server-side validation against the `orders` table.

**Learning:** Client-side code should never be trusted to specify order totals or trigger payment flows without server-side verification. Edge functions must validate user JWTs using `supabase.auth.getUser()` and query database records directly using `SUPABASE_SERVICE_ROLE_KEY` to ensure the payment amount and order status match authoritative state.

**Prevention:** Always extract and verify the JWT `Authorization` header in Supabase Edge Functions handling sensitive payment or third-party API operations. Fetch transaction amounts and permissions directly from the database server-side before executing external payment transactions.
