## 2025-05-15 - Hardened Edge Functions & Prevented Price Manipulation
**Vulnerability:** Edge Functions (`mpesa`, `sms`, `uber`) were publicly accessible without JWT verification. The `mpesa` function trusted client-provided amounts, allowing potential price manipulation.
**Learning:** Supabase Edge Functions do not automatically enforce authentication. Always verify the `Authorization` header and fetch sensitive data (like order totals) directly from the database using the Service Role.
**Prevention:** Use `supabase.auth.getUser(token)` in Edge Functions to verify identity. For payment-related functions, cross-reference request data with the database.
