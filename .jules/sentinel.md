# Sentinel Security Journal

## 2025-05-15 - Hardened M-Pesa Payment Flow
**Vulnerability:** Price manipulation and authorization bypass in the M-Pesa Edge Function. The function trusted the `amount` and `orderId` provided by the client without verifying the user's identity or the order's actual cost in the database.
**Learning:** Edge Functions that handle payments must never trust client-side data for sensitive values like amounts. They should always verify the user's JWT and fetch the source of truth from the database.
**Prevention:** Always implement JWT verification in Edge Functions and use the `SUPABASE_SERVICE_ROLE_KEY` (when necessary for validation) to fetch transaction details directly from the database based on the authenticated user's ID.
