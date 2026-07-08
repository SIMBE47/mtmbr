# Sentinel Security Journal

## 2026-07-06 - M-Pesa Price Manipulation & Auth Bypass
**Vulnerability:** The `mpesa` Edge Function accepted `amount` from the client request body and did not verify the user's JWT. This allowed anyone to trigger STK pushes for any order and, more critically, allowed malicious users to pay any amount (e.g., 1 KES) for high-value items by modifying the frontend request.
**Learning:** Supabase Edge Functions do not automatically enforce authentication or validate that client-provided data (like payment amounts) matches database records.
**Prevention:** Always verify the `Authorization` header using `supabase.auth.getUser()` and fetch sensitive transaction details (amounts, owner IDs) directly from the database using the Service Role before calling third-party payment APIs.
