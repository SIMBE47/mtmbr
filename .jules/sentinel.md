# Sentinel Security Journal

## 2025-05-15 - Price Manipulation in Payment Edge Functions
**Vulnerability:** The `mpesa` Edge Function originally accepted an `amount` parameter directly from the frontend request. An attacker could intercept the request and change the `amount` to a lower value (e.g., KES 1) while keeping the correct `orderId`, potentially bypassing payment checks if the callback only verifies the transaction status and not the amount paid against the order total.
**Learning:** Client-provided data in payment flows is untrusted. Even if the frontend calculates it correctly, the Edge Function must treat it as tainted.
**Prevention:** Always use the `orderId` to fetch the authoritative `total_amount` directly from the database using the Service Role. Verify that the authenticated user (`supabase.auth.getUser()`) is the one who actually owns the order before initiating any external payment requests.
