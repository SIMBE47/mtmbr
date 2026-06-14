## 2025-05-15 - Price Manipulation and Unauthorized Triggers in Edge Functions
**Vulnerability:** Payment functions and third-party integrations (SMS, Delivery) were exposed to unauthorized access and price manipulation. The M-Pesa STK Push function trusted the client-provided `amount` and `orderId`, allowing a malicious user to pay less than the required amount or trigger payments for other users' orders. SMS and Uber delivery functions lacked JWT verification, allowing anyone with the function URL to trigger potentially costly external API calls.

**Learning:** Trusting client-provided data for financial transactions or resource-intensive operations is a critical vulnerability. Even if the frontend is secure, the backend endpoints (like Edge Functions) must independently verify the requester's identity (via JWT) and the integrity of the transaction data (by fetching the source of truth from the database using a service role).

**Prevention:**
1. Always verify the `Authorization` header and the user's JWT in every Edge Function using `supabase.auth.getUser(token)`.
2. For payment functions, fetch the amount and ownership details directly from the database using `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and ensure the data hasn't been manipulated by the client.
3. Validate that the authenticated user owns the resource they are acting upon (e.g., `order.buyer_id === user.id`).
4. Explicitly check for the presence of the `Authorization` header to avoid runtime errors when extracting the token.

## 2025-05-15 - CI Build Failures due to Environment Variable Validation
**Vulnerability:** Not a direct security vulnerability, but a CI/CD reliability issue that can block security patches. Next.js prerendering fails if required environment variables (like Supabase keys) are missing or undefined during the build process.

**Learning:** When using libraries that perform strict validation of environment variables at startup (like the `lib/supabase.ts` client in this project), CI workflows must provide placeholder values if the real secrets are not available. This ensures that the build/lint steps can proceed even in forks or PRs where secrets are restricted.

**Prevention:** Always provide fallback/placeholder values in the GitHub Actions workflow for required environment variables during the `npm run build` step: `VARIABLE: ${{ secrets.VARIABLE || 'placeholder' }}`.
