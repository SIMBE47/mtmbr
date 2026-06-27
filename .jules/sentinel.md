## 2026-06-24 - M-Pesa Price Manipulation & IDOR
**Vulnerability:** The M-Pesa Edge Function's `/mpesa` endpoint trusted client-provided `amount` and `orderId` without verifying the user's identity or the actual order cost. This allowed attackers to pay arbitrary amounts for any order.
**Learning:** Supabase Edge Functions are publicly accessible by default and require manual `Authorization` header verification. Relying on frontend-provided data for financial transactions is a critical risk.
**Prevention:** Always implement JWT verification in Edge Functions that perform sensitive operations. Use the `SUPABASE_SERVICE_ROLE_KEY` to fetch authoritative data (like transaction amounts) directly from the database and verify ownership before proceeding.
