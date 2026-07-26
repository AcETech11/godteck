-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums
create type public.user_role as enum ('admin', 'member');
create type public.post_status as enum ('pending', 'approved', 'rejected', 'flagged');
create type public.waitlist_status as enum ('pending', 'approved', 'rejected');

-- Create Profiles Table
-- This table maps to Clerk users (id is text)
create table public.profiles (
    id text primary key,
    email text not null unique,
    full_name text,
    avatar_url text,
    role public.user_role not null default 'member',
    created_at timestamp with time zone not null default now()
);

-- Create Waitlist Table
create table public.waitlist (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    full_name text,
    phone text,
    status public.waitlist_status not null default 'pending',
    created_at timestamp with time zone not null default now()
);

-- Create Posts Table
create table public.posts (
    id uuid primary key default gen_random_uuid(),
    author_id text references public.profiles(id) on delete cascade not null,
    title text not null,
    content text not null,
    category text not null,
    image_url text,
    status public.post_status not null default 'pending',
    rejection_reason text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.waitlist enable row level security;
alter table public.posts enable row level security;

-- ==========================================
-- Profiles RLS Policies
-- ==========================================

-- Public can read profiles
create policy "Allow public read access to profiles"
on public.profiles for select
using (true);

-- Users can update their own profile
create policy "Allow users to update own profile"
on public.profiles for update
using (auth.uid()::text = id)
with check (auth.uid()::text = id);

-- ==========================================
-- Waitlist RLS Policies
-- ==========================================

-- Public can insert (join waitlist)
create policy "Allow public to join waitlist"
on public.waitlist for insert
with check (true);

-- Only admins can read waitlist entries
create policy "Allow admins to read waitlist"
on public.waitlist for select
using (
    (select role from public.profiles where id = auth.uid()::text) = 'admin'
);

-- Only admins can update waitlist entries
create policy "Allow admins to update waitlist"
on public.waitlist for update
using (
    (select role from public.profiles where id = auth.uid()::text) = 'admin'
);

-- ==========================================
-- Posts RLS Policies
-- ==========================================

-- Public can read ONLY approved posts
create policy "Allow public to read approved posts"
on public.posts for select
using (status = 'approved');

-- Authenticated members/users can insert pending posts
create policy "Allow authenticated users to insert pending posts"
on public.posts for insert
with check (
    auth.uid()::text = author_id
    and status = 'pending'
);

-- Author can read their own posts regardless of status
create policy "Allow authors to read own posts"
on public.posts for select
using (auth.uid()::text = author_id);

-- Admins can read ALL posts
create policy "Allow admins to read all posts"
on public.posts for select
using (
    (select role from public.profiles where id = auth.uid()::text) = 'admin'
);

-- Admins can update ALL posts
create policy "Allow admins to update all posts"
on public.posts for update
using (
    (select role from public.profiles where id = auth.uid()::text) = 'admin'
);

-- Admins can delete ALL posts
create policy "Allow admins to delete all posts"
on public.posts for delete
using (
    (select role from public.profiles where id = auth.uid()::text) = 'admin'
);

-- ==========================================
-- Triggers
-- ==========================================

-- Automatic updated_at handling for posts
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
    before update on public.posts
    for each row execute function public.handle_update_timestamp();

-- Note: Automatic profile generation when a user signs up via Supabase Auth
-- has been disabled as we are now using Clerk webhooks to sync profiles.
