-- WFC Club initial schema: profiles, sessions, events + RLS

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role text,
  company text not null default '',
  city text not null default 'Bandung',
  about text not null default '',
  interests text[] not null default '{}',
  looking_for text[] not null default '{}',
  avatar_hue integer not null default 175,
  initials text not null default '?',
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wfc_sessions (
  id uuid primary key default gen_random_uuid(),
  place text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  note text,
  topic text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.session_attendees (
  session_id uuid not null references public.wfc_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  place text not null,
  description text not null default '',
  expectations text[] not null default '{}',
  capacity integer not null default 20,
  price_idr integer not null default 0,
  audience text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.community_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists wfc_sessions_date_idx on public.wfc_sessions (date);
create index if not exists community_events_date_idx on public.community_events (date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wfc_sessions enable row level security;
alter table public.session_attendees enable row level security;
alter table public.community_events enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "sessions_select_authenticated" on public.wfc_sessions;
create policy "sessions_select_authenticated"
  on public.wfc_sessions for select
  to authenticated
  using (true);

drop policy if exists "sessions_insert_own" on public.wfc_sessions;
create policy "sessions_insert_own"
  on public.wfc_sessions for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "sessions_update_own" on public.wfc_sessions;
create policy "sessions_update_own"
  on public.wfc_sessions for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "sessions_delete_own" on public.wfc_sessions;
create policy "sessions_delete_own"
  on public.wfc_sessions for delete
  to authenticated
  using (auth.uid() = created_by);

drop policy if exists "session_attendees_select" on public.session_attendees;
create policy "session_attendees_select"
  on public.session_attendees for select
  to authenticated
  using (true);

drop policy if exists "session_attendees_insert_own" on public.session_attendees;
create policy "session_attendees_insert_own"
  on public.session_attendees for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "session_attendees_delete_own" on public.session_attendees;
create policy "session_attendees_delete_own"
  on public.session_attendees for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "events_select_authenticated" on public.community_events;
create policy "events_select_authenticated"
  on public.community_events for select
  to authenticated
  using (true);

drop policy if exists "event_rsvps_select" on public.event_rsvps;
create policy "event_rsvps_select"
  on public.event_rsvps for select
  to authenticated
  using (true);

drop policy if exists "event_rsvps_insert_own" on public.event_rsvps;
create policy "event_rsvps_insert_own"
  on public.event_rsvps for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "event_rsvps_delete_own" on public.event_rsvps;
create policy "event_rsvps_delete_own"
  on public.event_rsvps for delete
  to authenticated
  using (auth.uid() = user_id);
