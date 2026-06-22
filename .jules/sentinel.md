## 2025-05-14 - Price Manipulation in Payment Edge Function
**Vulnerability:** The `mpesa` Edge Function trusts the `amount` parameter provided in the request body from the client. A malicious user could manipulate this value to pay less than the intended price for a listing.
**Learning:** Client-provided data in financial transactions is a major security risk. The Edge Function should instead use the `orderId` to look up the correct amount from the database, which serves as the source of truth.
**Prevention:** Implement mandatory JWT verification to identify the requester and fetch transaction details (amounts, user IDs) directly from the database using the Supabase Service Role client to bypass RLS for validation purposes.
