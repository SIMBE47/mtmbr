# Sentinel Security Journal 🛡️

## 2026-07-10 - Unauthenticated Edge Functions
**Vulnerability:** Edge Functions (specifically `sms` and `uber`) were exposed without any authentication or authorization checks, allowing anyone with the function URL to trigger expensive third-party API calls (SMS/Uber).
**Learning:** Supabase Edge Functions do not automatically enforce JWT verification. Developers must explicitly extract the `Authorization` header and verify it using `supabase.auth.getUser()`. Leaking full error messages can also expose system internals.
**Prevention:** Always implement JWT verification in Edge Functions that perform sensitive operations. Use generic error messages in production responses while logging detailed errors internally.
