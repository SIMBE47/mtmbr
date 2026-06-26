# Sentinel Security Journal

## 2026-06-24 - Unauthenticated Edge Functions
**Vulnerability:** The `sms` Edge Function was accessible without any authentication, allowing anyone with the URL to consume API credits.
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. Manual verification using `supabase.auth.getUser(token)` is required. Using generic error messages instead of leaking internal errors is a core "Sentinel" principle.
**Prevention:** Always implement JWT verification in Edge Functions that perform sensitive operations. Use generic error messages in responses to avoid information leakage.
