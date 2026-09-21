-- iSchool BD Supabase schema (run in Supabase SQL editor)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  tier text check (tier in ('tier_1','tier_2','tier_3')) default 'tier_1',
  avatar text default 'tota_moyna_parrot',
  created_at timestamptz default now()
);

create table if not exists progress (
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  xp int not null default 0 check (xp >= 0),
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  streak_days int not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, topic)
);

alter table profiles enable row level security;
alter table progress enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own progress" on progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
