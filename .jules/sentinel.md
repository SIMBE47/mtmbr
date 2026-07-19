# Sentinel Security Journal 🛡️

This journal documents critical architectural vulnerabilities, learnings, and prevention strategies discovered within the THRIFTR codebase.

## 2026-07-12 - Unauthenticated Edge Functions Exposing Third-Party API Credits
**Vulnerability:** The `uber` Edge Function was exposed publicly without any authentication or authorization verification. Any client could invoke the endpoint to request delivery estimates or create orders, directly consuming the application's third-party Uber API quotas and client credits.
**Learning:** Supabase Edge Functions do not automatically enforce authentication unless developers explicitly check the `Authorization` header and authenticate the token against the Supabase Auth system. Boilerplate endpoints are vulnerable to unauthorized resource use if left unhardened.
**Prevention:** Ensure every custom Edge Function handling sensitive or paid actions explicitly checks for the `Authorization` header, extracts the bearer token case-insensitively with `.trim()`, and authenticates the user using `supabase.auth.getUser(token)`.
