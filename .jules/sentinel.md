## 2025-05-15 - [CRITICAL] Price Manipulation in M-Pesa Edge Function
**Vulnerability:** The `mpesa` Edge Function originally accepted the `amount` to be charged directly from the client-side request body. An attacker could have modified the request to pay a lower price than the item's actual value.
**Learning:** Payment Edge Functions must never trust the amount provided by the client. Always use the `orderId` to fetch the source-of-truth amount from the database using the Service Role.
**Prevention:** Always implement JWT verification in Edge Functions that handle sensitive operations. Verify user ownership of the resource (e.g., `buyer_id` on an order) and fetch transaction details directly from the database before proceeding with third-party integrations.
