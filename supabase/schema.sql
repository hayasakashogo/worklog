-- ============================================
-- Work-Log DB Schema
-- ============================================

-- profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  min_hours numeric(5,2) not null default 140,
  max_hours numeric(5,2) not null default 180,
  default_start_time time not null default '09:00',
  default_end_time time not null default '18:00',
  default_rest_minutes integer not null default 60,
  holidays integer[] not null default '{0,6}',
  include_national_holidays boolean not null default true,
  pdf_filename_template text not null default '{YYYY}年{MM}月_稼働報告書',
  created_at timestamptz not null default now()
);

alter table clients enable row level security;

create policy "Users can view own clients"
  on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients"
  on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients"
  on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients"
  on clients for delete using (auth.uid() = user_id);

-- time_records
create table if not exists time_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  date date not null,
  start_time time,
  end_time time,
  rest_minutes integer not null default 60,
  note text default '',
  is_off boolean not null default false,
  created_at timestamptz not null default now(),
  unique(client_id, date)
);

alter table time_records enable row level security;

create policy "Users can view own time records"
  on time_records for select using (auth.uid() = user_id);
create policy "Users can insert own time records"
  on time_records for insert with check (auth.uid() = user_id);
create policy "Users can update own time records"
  on time_records for update using (auth.uid() = user_id);
create policy "Users can delete own time records"
  on time_records for delete using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table time_records;

-- monthly_notes
create table if not exists monthly_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references clients on delete cascade not null,
  year_month text not null,
  note text not null default '',
  created_at timestamptz default now(),
  unique(user_id, client_id, year_month)
);

alter table monthly_notes enable row level security;

create policy "Users can manage own monthly_notes"
  on monthly_notes for all using (auth.uid() = user_id);
