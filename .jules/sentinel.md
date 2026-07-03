## 2026-07-01 - Price Manipulation and Unauthorized Access in M-Pesa Function
**Vulnerability:** The M-Pesa Edge Function trusted the `amount` provided by the client and did not verify the user's identity via JWT. This allowed any user (or even unauthenticated users) to trigger STK pushes for any order and manipulate the payment amount.
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. Developers must manually extract the `Authorization` header and use `supabase.auth.getUser()` to verify the caller.
**Prevention:** Always fetch authoritative transaction data (like amounts) directly from the database using the Service Role, and verify that the authenticated user owns the resource they are acting upon.
