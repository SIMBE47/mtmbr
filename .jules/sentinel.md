# Sentinel Security Journal

This journal documents critical security learnings, vulnerability patterns, and architectural insights discovered during the hardening of the THRIFTR platform.

## 2026-07-12 - Payment Price Manipulation via Unauthenticated Edge Functions
**Vulnerability:** Unauthenticated invocation and missing database-side amount verification in the M-Pesa Edge Function (`/mpesa`). A malicious user could trigger payment flows directly without any user authentication, and manipulate the transaction amount in the request payload, paying as little as 1 KES for high-value items, while still successfully completing checkout on the platform.
**Learning:** Edge Functions acting as payment triggers are highly sensitive. When they rely entirely on client-supplied input (such as `amount` or `buyer_id`) without performing JWT verification or validating the payment details against a server-side source of truth (the database `orders` record), the system becomes vulnerable to client-side request tampering.
**Prevention:** Always authenticate the client request inside Edge Functions using `supabase.auth.getUser(token)`. Never trust client-supplied amounts or order parameters directly. Retrieve the canonical order record from the database using a service role client to bypass user RLS, and verify that the payment amount matches the database-recorded total and the order belongs to the authenticated user before proceeding.
