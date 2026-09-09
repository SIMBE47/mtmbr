## 2026-07-12 - Missing Backend Order Validation in M-Pesa STK Push Edge Function

**Vulnerability:**
The `mpesa` Edge Function accepted `amount` directly from the client request body (`req.json()`) without validating user authentication or verifying the order's authentic price in the database. Malicious users could send an STK push prompt for 1 KES for a high-value item while creating an order record, bypassing expected charges.

**Learning:**
Payment integration functions should never trust client-provided monetary amounts or request payloads. Relying on client-sent payment parameters creates financial risk and allows price tampering.

**Prevention:**
Always verify the caller's JWT token via `supabase.auth.getUser()` and query order records directly from the database using service role credentials to enforce authentic total amounts and ensure the requester owns the order.
