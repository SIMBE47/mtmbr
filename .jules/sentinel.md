# Sentinel Security Journal

## 2026-07-12 - [Hardening M-Pesa Edge Function and Preventing Price Manipulation]
**Vulnerability:** The `mpesa` Supabase Edge Function accepted the payment `amount` parameter directly from client-side requests. This allowed malicious users or compromised client devices to arbitrarily modify the payment amounts for orders before triggering the Safaricom STK push, potentially purchasing expensive items for low prices or even negative values. Additionally, the endpoint lacked JWT validation, exposing it to unauthenticated trigger requests.

**Learning:** Relying on client-controlled parameters for monetary and transaction-critical values is a severe security gap. Edge functions must operate on the principle of least trust. Even if frontend code is clean, API endpoints must validate and retrieve authoritative facts (such as actual order pricing) directly from the trusted database of record, using a secure service role key to bypass RLS when needed.

**Prevention:** Never trust client-supplied payment amounts. Always extract the user's validated JWT, verify identity, query the target order records, and enforce server-side validation to ensure the order is in a `pending` state and the amount matches the database-of-record value exactly.
