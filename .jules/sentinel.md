## 2026-06-23 - Price Manipulation and Authentication Gap in Payment Edge Function
**Vulnerability:** The `/mpesa` Edge Function trusted client-provided payment amounts and lacked JWT verification, allowing anyone to trigger M-Pesa STK pushes for any order with any amount.
**Learning:** Edge Functions in Supabase do not automatically enforce authentication or RLS when using the Service Role. They must manually verify the user's JWT from the `Authorization` header and fetch sensitive transaction data directly from the database to ensure integrity.
**Prevention:** Always verify the `Authorization` header in Edge Functions that perform sensitive operations and use the database as the source of truth for critical values like prices and user permissions.
