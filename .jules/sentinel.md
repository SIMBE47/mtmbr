## 2025-05-15 - [Critical] Price Manipulation in M-Pesa Integration
**Vulnerability:** The M-Pesa payment initiation function trusted the `amount` passed from the client-side, allowing malicious users to potentially pay less than the listed price. It also lacked authentication, allowing anyone to trigger an STK push for any order ID.
**Learning:** Edge functions that handle financial transactions must always re-verify price/amount data from the database (source of truth) and strictly enforce JWT authentication and object ownership.
**Prevention:** Never trust client-provided amounts for payments. Always fetch the amount from the database based on a verified order ID and check that the `auth.uid()` matches the `buyer_id`.
