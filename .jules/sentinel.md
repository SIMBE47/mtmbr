## 2026-06-24 - Secure Payment Authorization Pattern
**Vulnerability:** The M-Pesa Edge Function was accepting the payment `amount` directly from the client request. This allowed a malicious user to modify the price of any item to a lower value (e.g., KES 1) during the checkout process. Additionally, the function lacked JWT verification, allowing anyone to trigger STK pushes for any order ID.

**Learning:** Supabase Edge Functions do not automatically enforce authentication or authorization. When handling sensitive operations like payments, the function must manually verify the user's JWT and fetch authoritative data (like order amounts) directly from the database using a service role client to bypass RLS for validation purposes.

**Prevention:** Always use the "Verify-in-DB" pattern for Edge Functions:
1. Extract and verify the JWT from the `Authorization` header.
2. Use the `SUPABASE_SERVICE_ROLE_KEY` to fetch the record from the database.
3. Compare the authenticated `user.id` with the record's owner (e.g., `buyer_id`).
4. Use the database's value for sensitive fields (amount, status, etc.) instead of request body parameters.
