-- ================================================================
-- PalmWis — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ================================================================

create extension if not exists "pgcrypto";

-- ── Readings ─────────────────────────────────────────────────────
create table if not exists public.readings (
  id            uuid        default gen_random_uuid() primary key,
  email         text,
  reading_data  jsonb       not null,
  palm_type     text,
  share_token   text        unique default encode(gen_random_bytes(12), 'hex'),
  created_at    timestamptz default now()
);

-- Anyone can read by share_token, only server inserts (via service role)
alter table public.readings enable row level security;

create policy "Public read via share token"
  on public.readings for select using (true);

-- ── User Credits ─────────────────────────────────────────────────
create table if not exists public.user_credits (
  email           text        primary key,
  credits         integer     default 3,
  plan            text        default 'free',   -- free | credits | monthly
  plan_expires_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.user_credits enable row level security;

-- Server manages credits via service role; no public access needed
-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_readings_share_token on public.readings (share_token);
create index if not exists idx_readings_email       on public.readings (email);
