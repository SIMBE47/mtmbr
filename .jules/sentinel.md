## 2025-05-15 - Price Manipulation and Unauthorized Triggers in Edge Functions
**Vulnerability:** Payment functions and third-party integrations (SMS, Delivery) were exposed to unauthorized access and price manipulation. The M-Pesa STK Push function trusted the client-provided `amount` and `orderId`, allowing a malicious user to pay less than the required amount or trigger payments for other users' orders. SMS and Uber delivery functions lacked JWT verification, allowing anyone with the function URL to trigger potentially costly external API calls.

**Learning:** Trusting client-provided data for financial transactions or resource-intensive operations is a critical vulnerability. Even if the frontend is secure, the backend endpoints (like Edge Functions) must independently verify the requester's identity (via JWT) and the integrity of the transaction data (by fetching the source of truth from the database using a service role).

**Prevention:**
1. Always verify the `Authorization` header and the user's JWT in every Edge Function using `supabase.auth.getUser(token)`.
2. For payment functions, fetch the amount and ownership details directly from the database using `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and ensure the data hasn't been manipulated by the client.
3. Validate that the authenticated user owns the resource they are acting upon (e.g., `order.buyer_id === user.id`).
4. Explicitly check for the presence of the `Authorization` header to avoid runtime errors when extracting the token.
