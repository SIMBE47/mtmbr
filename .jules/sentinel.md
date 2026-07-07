# Sentinel Security Journal

## 2026-07-06 - Edge Function Price Manipulation & Auth Gap
**Vulnerability:** The M-Pesa Edge Function previously accepted `amount` and `phoneNumber` directly from the client request body and lacked JWT verification. This allowed any user (or even unauthenticated attackers) to initiate M-Pesa STK Pushes for any order ID, and more critically, allowed them to manipulate the payment amount to KES 1.

**Learning:** Supabase Edge Functions do not automatically enforce JWT verification or Row-Level Security (RLS) when invoked. They are public endpoints unless explicitly hardened. Trusting client-side data for financial transactions is a critical failure.

**Prevention:**
1. Always extract and verify the JWT using `supabase.auth.getUser(token)` within the Edge Function.
2. Use the `SUPABASE_SERVICE_ROLE_KEY` to fetch authoritative data (like price and owner ID) directly from the database to bypass/validate client-provided values.
3. Validate that the authenticated user's ID matches the resource owner (e.g., `order.buyer_id`).
