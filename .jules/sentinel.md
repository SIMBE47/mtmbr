## 2026-06-21 - Price Manipulation in Payment Edge Function
**Vulnerability:** The M-Pesa Edge Function trusted the 'amount' parameter sent from the client-side, allowing users to potentially pay less than the actual price of a listing.
**Learning:** Edge Functions that handle payments must always verify transaction details against the database (source of truth) using a Service Role client, rather than trusting client-provided data.
**Prevention:** Never use client-provided amounts for payments. Fetch the record from the database using a unique ID (like orderId) and use the server-side value.
