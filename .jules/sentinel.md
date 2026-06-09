## 2025-05-22 - Unauthorized Edge Function Access

**Vulnerability:** The `sms` and `uber` Edge Functions in `supabase/functions/` were found to be missing authentication and authorization checks. They processed requests directly without verifying the caller's identity.

**Learning:** Because Supabase Edge Functions are accessible via a public URL, they require manual JWT verification using the `Authorization` header. If left unprotected, any user with the project's public `anon` key can trigger these functions, leading to potential SMS spam (costing the owner money) or unauthorized third-party service calls like Uber Direct.

**Prevention:** Always implement JWT verification in Edge Functions that perform sensitive or costly operations. Use `supabase.auth.getUser(token)` to ensure the request comes from a valid authenticated user before proceeding with the function logic.
