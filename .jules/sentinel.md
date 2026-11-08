# Sentinel Security Journal

## 2026-07-12 - Unauthenticated SMS Edge Function Toll Fraud Vulnerability
**Vulnerability:** The `sms` Supabase Edge Function (`supabase/functions/sms/index.ts`) was publicly reachable without authentication or authorization checks. Any anonymous actor could send arbitrary HTTP requests specifying `to` and `message` payloads, resulting in arbitrary outbound SMS messages via Africa's Talking API using backend credentials, causing SMS toll fraud, spam, and financial drain.
**Learning:** Edge Functions acting as proxies to third-party paid communication or telephony APIs must never rely solely on obscurity or client-side calls. Supabase client calls (`supabase.functions.invoke()`) transmit user JWTs in the `Authorization` header by default, which Edge Functions must validate server-side using `supabase.auth.getUser(token)`.
**Prevention:** Always enforce JWT verification and strict payload constraints (non-empty string checks, message length bounds) on communication proxies before delegating requests to external third-party services.
