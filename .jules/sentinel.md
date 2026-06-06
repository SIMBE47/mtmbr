## 2025-05-15 - Trusting Client-Side Amounts in Payment Initiation
**Vulnerability:** The M-Pesa STK Push Edge Function previously accepted the payment `amount` directly from the client-side request body without verification.
**Learning:** Client-side data should never be trusted for sensitive operations like payments. A malicious user could have modified the `amount` field in the request to pay less than the actual price of an order.
**Prevention:** Always fetch sensitive data (like prices or amounts) directly from the server-side database using a trusted identifier (like an `order_id`) and verify the requester's identity (JWT) and ownership before proceeding with the transaction.
