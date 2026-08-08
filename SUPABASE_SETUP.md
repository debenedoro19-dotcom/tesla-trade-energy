# Supabase Setup (Optional but Recommended for Production)

This makes your data persist across devices and browsers, and enables real multi-user admin access.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign up / log in
2. Click **New Project**
3. Choose a name (e.g. `tesla-trade`), set a strong database password, choose a region close to you
4. Wait ~2 minutes for the project to be ready

## 2. Create the tables

Go to **SQL Editor** → New query and paste this entire script, then click **Run**:

```sql
-- Appointments
create table appointments (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  preferred_date text,
  format text check (format in ('In-Person', 'Virtual')),
  status text check (status in ('pending', 'approved', 'rejected', 'completed')) default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Inventory
create table inventory (
  id text primary key,
  title text not null,
  category text check (category in ('Vehicles', 'Energy', 'Robotics')),
  price numeric not null,
  status text check (status in ('available', 'sold', 'pending')) default 'available',
  description text,
  image text,
  created_at timestamptz default now()
);

-- Testimonials
create table testimonials (
  id text primary key,
  name text not null,
  role text,
  quote text not null,
  rating int check (rating between 1 and 5) default 5,
  approved boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional but recommended)
alter table appointments enable row level security;
alter table inventory enable row level security;
alter table testimonials enable row level security;

-- Allow public read on inventory & approved testimonials
create policy "Public can read available inventory"
  on inventory for select using (status = 'available');

create policy "Public can read approved testimonials"
  on testimonials for select using (approved = true);

-- Allow authenticated / anon insert for appointments (public form)
create policy "Anyone can submit appointments"
  on appointments for insert with check (true);

-- For full admin control you can temporarily allow all operations
-- (In production you should lock this down with proper auth)
create policy "Allow all for admin (temporary)"
  on appointments for all using (true) with check (true);

create policy "Allow all inventory for admin (temporary)"
  on inventory for all using (true) with check (true);

create policy "Allow all testimonials for admin (temporary)"
  on testimonials for all using (true) with check (true);
```

## 3. Get your keys

1. In Supabase go to **Project Settings → API**
2. Copy:
   - Project URL
   - `anon` `public` key

## 4. Add the keys to your project

### Locally
Create a file `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ADMIN_PASSWORD=your-strong-password
```

### On Vercel
1. Project → Settings → Environment Variables
2. Add the same three variables
3. Redeploy

## 5. Done

Your site will now use Supabase automatically. Data will be shared across all devices.
