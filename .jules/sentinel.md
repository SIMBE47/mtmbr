## 2026-06-20 - [Critical] Price Manipulation in Payment Edge Functions
**Vulnerability:** The M-Pesa Edge Function trusted the `amount` field provided in the client's request body to initiate STK Push payments. This allowed a malicious user to pay any amount (e.g., KES 1) for a high-value item by intercepting the network request.
**Learning:** Payment amounts must always be sourced from the server's database using a verified identifier (like `order_id`). Any amount passed from the client should be ignored or used only for redundant validation.
**Prevention:** Always verify the user's JWT in Edge Functions before processing sensitive actions. Use the Supabase Service Role to fetch the "source of truth" data from the database and verify ownership of the resource being paid for.
