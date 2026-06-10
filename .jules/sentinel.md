## 2025-06-10 - [CRITICAL] Price Manipulation and Unauthorized Access in Payment Edge Function
**Vulnerability:** The `mpesa` Edge Function accepted `amount` and `orderId` from the client without verification. A malicious user could provide a lower `amount` than the actual order total, or trigger payments for orders they do not own. Additionally, `sms` and `uber` functions were accessible without authentication.
**Learning:** Supabase Edge Functions do not automatically verify the user's JWT from the `Authorization` header. They must be manually hardened by calling `supabase.auth.getUser(token)`. Furthermore, sensitive transaction data (like prices) should always be fetched from the database using the Service Role to prevent client-side manipulation.
**Prevention:**
1. Always verify the JWT in Edge Functions if the operation should be authenticated.
2. Fetch transaction details (amount, items, etc.) directly from the database using a trusted identifier (like `orderId`) instead of trusting client-provided values.
3. Validate that the authenticated user has the right to perform the action (e.g., check `buyer_id` on the order).
