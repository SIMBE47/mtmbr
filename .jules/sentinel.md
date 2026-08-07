## 2026-07-12 - Hardening M-Pesa Edge Function and Parameter Validation

**Vulnerability:** Unauthenticated/unvalidated payment initiation in the M-Pesa Edge Function allowed anyone to invoke the STK push, manipulate the payment amount parameter, and process payment callbacks using spoofed transaction IDs.

**Learning:** Relying on client-supplied payment amounts and request parameters creates severe business logic vulnerabilities. Edge Functions must independently authenticate incoming requests via JWT tokens, retrieve authentic order pricing from the database using service-role level access, and conceal critical transaction identifiers (such as `CheckoutRequestID`) from frontends to prevent verification bypass or callback spoofing.

**Prevention:** Always extract and verify the Authorization header using `supabase.auth.getUser(token)` within Edge Functions. Fetch the reference record (e.g., the `order`) from the database server-side to validate ownership, status (must be `pending`), and pricing. Only return non-sensitive/safe identifiers to the frontend, utilizing safer secondary attributes like `MerchantRequestID` for client tracking.
