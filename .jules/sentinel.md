# Sentinel Security Journal

## 2026-06-24 - M-Pesa Edge Function Hardening
**Vulnerability:** The `mpesa` Edge Function was unauthenticated and trusted client-side `amount` and `orderId` values. A malicious actor could trigger an STK push for an arbitrary amount or for an order they do not own by directly calling the function.
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. Payment functions must verify user identity and fetch authoritative transaction details (like price) directly from the database to prevent manipulation.
**Prevention:** Always verify the `Authorization` header in Edge Functions and use the Supabase Service Role to perform server-side validation against the database source of truth.
