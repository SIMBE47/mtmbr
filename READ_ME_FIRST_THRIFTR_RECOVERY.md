# THRIFTR Recovery Guide

This is the canonical app folder to use going forward:

`THRIFTR-ACTUAL-APP`

Do not use the raw zip contents directly unless we explicitly compare and merge them.

## Which Zip Was Right?

The Claude zip was closer than the Jules/Firebase-style build because it used:

- Next.js
- Supabase
- App Router pages
- A deployable Vercel-style structure

But the original Claude SQL was not safe to run as-is.

## Why The Old Supabase SQL Crashed

The old migration inserted demo stores with:

`owner_id = '00000000-0000-0000-0000-000000000000'`

But `owner_id` referenced `auth.users(id)`. Since Supabase did not have a real auth user with that ID, the seed insert fails.

It also created `applications.name`, while the app inserts `applications.store_name`, and it queried a `profiles` table that the migration did not create.

## What Was Fixed

The fixed migration is:

`supabase/migrations/001_initial_schema.sql`

It now:

- Creates `profiles`
- Creates store applications using `store_name`
- Creates real store-owner fields like contact phone, WhatsApp phone, Instagram, and location
- Creates listings with no mock stores
- Creates orders, payments, disputes, follows, saved listings, events
- Creates buyer/store text messaging with `conversations` and `messages`
- Enables RLS on all public tables
- Adds admin/owner/buyer access policies
- Creates no fake stores and no fake listings

## What To Run In Supabase

Run this file in Supabase SQL Editor:

`supabase/migrations/001_initial_schema.sql`

Run the whole file once.

If your Supabase project already has half-created THRIFTR tables from the failed attempt, this fixed file drops and recreates the THRIFTR tables.

## Admin Setup

Admin is no longer hardcoded to an email in the frontend.

After you sign in once, go to Supabase SQL Editor and run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with the exact email you used to sign in.

## Real Store Flow

1. Store owner signs in.
2. Store owner goes to `/enroll`.
3. Store owner submits store name, location, phone, Instagram, and description.
4. Admin opens `/admin`.
5. Admin approves the application.
6. The app creates a real store for that owner.
7. Owner can add listings in `/dashboard`.

No mock stores are required.

## Buyer/Store Messaging

Messaging has been added:

- Buyer opens a listing.
- Buyer clicks `MESSAGE STORE`.
- App creates or opens a conversation.
- Buyer and store can text inside `/messages`.

This requires the fixed SQL schema because it creates `conversations` and `messages`.

## Local Run

From this folder:

```bash
npm install
npm run dev
```

Then open:

`http://localhost:3000`

## Deploy Flow

1. Push `THRIFTR-ACTUAL-APP` to GitHub.
2. Import the GitHub repo into Vercel.
3. Add environment variables from `.env.example`.
4. Run the fixed Supabase SQL.
5. Sign in once.
6. Promote your profile to admin via SQL.
7. Test store application, admin approval, listing creation, checkout, and messaging.

