## 2026-07-12 - Missing Backend Order Validation in M-Pesa STK Push Edge Function

**Vulnerability:**
The `mpesa` Edge Function accepted `amount` directly from the client request body (`req.json()`) without validating user authentication or verifying the order's authentic price in the database. Malicious users could send an STK push prompt for 1 KES for a high-value item while creating an order record, bypassing expected charges.

**Learning:**
Payment integration functions should never trust client-provided monetary amounts or request payloads. Relying on client-sent payment parameters creates financial risk and allows price tampering.

**Prevention:**
Always verify the caller's JWT token via `supabase.auth.getUser()` and query order records directly from the database using service role credentials to enforce authentic total amounts and ensure the requester owns the order.

## 2026-07-12 - Missing Supabase Environment Variables in Next.js CI Build Workflows

**Vulnerability:**
During Next.js static prerendering (`next build`), routes that initialize the Supabase client (`lib/supabase.ts`) fail when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are undefined, causing PR CI builds to fail if repository secrets are restricted or absent.

**Learning:**
Next.js static page generation executes top-level client initializations at build time. In GitHub Actions PR workflows (especially for forks/external PRs), repository secrets are withheld by default.

**Prevention:**
Provide fallback placeholder environment variables in workflow files using expression syntax (e.g., `${{ secrets.VARIABLE || 'placeholder' }}`) to allow successful build-time static evaluation while keeping production secrets secure.
