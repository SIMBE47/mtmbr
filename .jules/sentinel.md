# Sentinel Security Journal

## 2026-07-12 - Missing Authentication on Sensitive Edge Functions
**Vulnerability:** Publicly accessible Supabase Edge Functions (e.g., Africa's Talking SMS) lacked JWT verification, allowing anyone to trigger third-party API requests and exhaust API credits.
**Learning:** Supabase Edge Functions are public HTTP endpoints by default. Unless explicitly hardened with token extraction and user verification via `supabase.auth.getUser()`, they can be invoked anonymously from any client, leading to potential unauthorized usage and billing liabilities.
**Prevention:** Always verify the `Authorization` header, parse the Bearer token case-insensitively, and validate user identity with `supabase.auth.getUser(token)` before performing any backend operations or calling third-party services.
