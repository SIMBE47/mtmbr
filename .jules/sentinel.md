# Sentinel Security Journal

## 2026-07-12 - Missing JWT Verification in Supabase Edge Functions
**Vulnerability:** Edge Functions such as the SMS sending microservice lack authentication and authorization verification. Unauthenticated external callers could invoke the function arbitrarily, leading to spamming, resource exhaustion, financial theft via API costs, or unauthorized notifications.
**Learning:** Supabase Edge Functions by default do not enforce authentication unless explicitly validated in the Deno handler. The `supabase.functions.invoke` utility from the client library automatically transmits the user's JWT in the `Authorization` header, but the server-side code must manually extract, sanitize, and verify this token using `supabase.auth.getUser()`.
**Prevention:** Always verify the presence of the `Authorization` header, extract the bearer token with case-insensitive and whitespace-safe patterns (e.g., `.replace(/^Bearer /i, '').trim()`), and call `supabase.auth.getUser()` to authenticate the user's session before performing sensitive actions.
