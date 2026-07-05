## 2026-07-01 - Harden M-Pesa Edge Function
**Vulnerability:** The M-Pesa Edge Function allowed unauthenticated STK Push requests and trusted the `amount` parameter from the client, enabling price manipulation.
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. If a function performs sensitive operations like payments, it must manually verify the `Authorization` header and fetch authoritative data (like transaction amounts) directly from the database using the Service Role to prevent tampering.
**Prevention:** Always implement manual JWT verification in Edge Functions and use server-side data as the source of truth for critical operations.
