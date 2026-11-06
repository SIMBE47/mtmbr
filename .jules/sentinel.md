# Sentinel Security Journal

## 2026-07-12 - Critical: Unauthenticated SMS Edge Function Abuse
**Vulnerability:** The `sms` Supabase Edge Function (`supabase/functions/sms/index.ts`) accepted invocation without authenticating callers or validating the JWT against Supabase Auth. Any anonymous client could send arbitrary SMS text messages to arbitrary phone numbers using the server's Africa's Talking API key and credentials.
**Learning:** Edge Functions in Supabase by default do not enforce authentication unless explicitly verified in code or configured with gateway auth. In client-facing apps invoking edge functions via `supabase.functions.invoke()`, passing the user's JWT in the Authorization header must be validated using `supabase.auth.getUser()` before processing requests.
**Prevention:** Always verify the caller's JWT using `supabase.auth.getUser()` and validate payload structure and constraints (such as recipient and message lengths) before performing third-party billing-associated operations (such as SMS or notifications).
