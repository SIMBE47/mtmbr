# Sentinel Security Journal

This journal documents critical security learnings, vulnerability patterns, and architectural security findings for this repository.

## 2026-07-12 - M-Pesa Edge Function Authorization and Amount Validation
**Vulnerability:** The M-Pesa STK Push Edge Function lacked JWT token authentication and did not validate the payment amount or order ownership on the server side. A malicious client could manipulate the payment amount or trigger arbitrary STK Push requests for orders belonging to other users.
**Learning:** Payments initiated from the client should never treat client-supplied parameters (like amount) as the source of truth without backend verification. In serverless edge functions, we must always enforce user authorization and query the database for the canonical record to validate transaction details before calling payment gateways.
**Prevention:** Always authenticate the user JWT via the `Authorization` header and query the database to verify the order's status is 'pending', the order is owned by the authenticated buyer, and the client-specified amount matches the order's true `total_amount` before processing payments.
