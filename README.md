# THRIFTR

**The Virtual Thrift Mall - Nairobi, Kenya**  
*Badilisha. Nunua. Starehe.*

## What's Built

| Page | Route | Status |
|------|-------|--------|
| Landing page | `/` | Complete |
| The Mall | `/mall` | Complete |
| Store Directory | `/stores` | Complete |
| Store Storefront | `/store/[slug]` | Complete |
| Listing Detail | `/listing/[id]` | Complete |
| Checkout + M-Pesa UI | `/checkout` | UI complete |
| Store Owner Dashboard | `/dashboard` | Complete |
| Admin Panel | `/admin` | Complete |
| Store Enrollment | `/enroll` | Complete |
| Buyer / Store Messages | `/messages` | Complete |

Stack: Next.js 15, TypeScript, Tailwind CSS v4, Supabase Auth, Supabase Database, and Supabase Edge Functions.

## Run Locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Fill `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then open `http://localhost:3000`.

## Clean Supabase Setup

Use `supabase/migrations/001_initial_schema.sql` for a fresh or failed setup Supabase project. It creates the real tables and RLS policies without mock stores or mock listings.

Important: this schema drops old THRIFTR tables first. Do not run it on a database that already contains real customer/store data.

After running the schema:

1. Enable Google Auth in Supabase.
2. Sign in once through the app so your profile row is created.
3. Promote your own account to admin from Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

Admin access is controlled by `profiles.role = 'admin'`. There is no public admin toggle.

## Deploy To Vercel

1. Push `THRIFTR-ACTUAL-APP` to GitHub as the real app repository.
2. Import the GitHub repository into Vercel.
3. Add the two public Supabase environment variables in Vercel project settings.
4. Deploy.
5. Add the final Vercel URL to Supabase Auth URL Configuration.

## Production Integrations Still Needed

| Integration | Status |
|-------------|--------|
| M-Pesa Daraja | Edge Function scaffold exists; needs real Paybill credentials and sandbox testing |
| Africa's Talking SMS | Edge Function scaffold exists; needs real API credentials |
| Uber Direct | Edge Function scaffold exists; should remain Phase 2 |
| Cloudinary Uploads | Not yet connected; dashboard currently accepts image URLs |
| Metrics Dashboards | Basic counts exist; full day/week/month analytics should use the `events` table |

## Safe Build Rule

Do not push the raw zip folders directly. Use this folder as the source of truth:

`THRIFTR-ACTUAL-APP`
