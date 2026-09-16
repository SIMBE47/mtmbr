# Sentinel Security Journal

## 2026-07-12 - Authentication Enforced on Unprotected SMS Edge Function

**Vulnerability:**
The `sms` Edge Function (`supabase/functions/sms/index.ts`) was publicly accessible without authentication or payload validation, allowing unauthenticated remote requests to send arbitrary SMS messages and deplete third-party messaging API balances.

**Learning:**
Supabase Edge Functions are publicly accessible via HTTP endpoints by default unless explicit JWT validation (`supabase.auth.getUser()`) is performed on the incoming `Authorization` header within the function body.

**Prevention:**
Always inspect the `Authorization` header and verify user JWTs in Deno Edge Functions using `supabase.auth.getUser()` before processing sensitive third-party API operations.
