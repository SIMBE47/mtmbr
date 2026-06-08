## 2025-05-15 - [CRITICAL] Price Manipulation & Missing Auth in Payment Edge Function
**Vulnerability:** The `mpesa` Edge Function allowed any user with the public `anon` key to trigger an M-Pesa STK push for any `order_id` with an arbitrary `amount`. A malicious user could specify a price of 1 KES for a high-value item or trigger payments for other users' orders.
**Learning:** Initial scaffolded Edge Functions often prioritize "making it work" over security, leading to a dangerous reliance on client-provided data for sensitive operations like payments.
**Prevention:**
1. Always verify the user's JWT from the `Authorization` header using `supabase.auth.getUser()`.
2. Never trust sensitive data (amounts, IDs, status) sent from the client.
3. Fetch the source of truth from the database using a service role client.
4. Implement strict authorization checks (e.g., `order.buyer_id === user.id`) before proceeding with side effects.
5. Ensure the resource is in the correct state (e.g., `order.status === 'pending'`) to prevent replay attacks or state corruption.
