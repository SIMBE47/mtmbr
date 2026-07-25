## 2026-07-12 - Client-Side Price Manipulation & Unauthenticated Edge Functions

**Vulnerability:**
The M-Pesa Edge Function (`supabase/functions/mpesa/index.ts`) accepted payment amounts directly from client-side requests without verifying user authenticity or validating the payment amount against database records. This permitted unauthorized calls to the billing API and price manipulation on checkout.

**Learning:**
Client-side inputs should never be trusted for sensitive operations like payment amounts. In a Serverless Edge Function architecture, user JWT authorization headers must be explicitly checked and validated via `supabase.auth.getUser(token)` before processing.

**Prevention:**
Always authenticate incoming Edge Function calls and validate transaction parameters (e.g. order `total_amount` and `status`) on the server-side directly against the database of record before initiating payment gateways.
