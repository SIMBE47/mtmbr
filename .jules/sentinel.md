## 2025-05-15 - Unauthenticated Edge Functions

**Vulnerability:** The `sms` and `uber` Supabase Edge Functions were completely unauthenticated, allowing anyone with the function URL to trigger SMS messages or Uber delivery requests.

**Learning:** While `supabase.functions.invoke` automatically sends the JWT, the receiving Edge Function must explicitly verify it using `supabase.auth.getUser(token)` to ensure the request is authorized.

**Prevention:** Always implement JWT verification in Edge Functions that perform sensitive actions or call paid third-party APIs. Verify the `Authorization` header exists and is valid before processing the request.
