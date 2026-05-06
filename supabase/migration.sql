-- ============================================================
-- BETH PLATFORM — SUPABASE MIGRATION
-- Run this in the Supabase SQL Editor for project jwfdxhblkmbmdetifxlj
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  created_at  timestamptz default now()
);

create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  name            text not null,
  role            text not null default 'AGENT' check (role in ('SUPERADMIN', 'ADMIN', 'AGENT')),
  organization_id uuid references organizations(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists campaigns (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  budget          float default 0,
  reward_per_scan int default 10,
  painter_margin  float default 0.05,
  system_revenue  float default 0.25,
  status          text default 'ACTIVE',
  organization_id uuid not null references organizations(id),
  created_at      timestamptz default now()
);

create table if not exists qr_codes (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  painter_id      uuid references profiles(id),
  reward_points   int not null default 10,
  expiration_date timestamptz,
  status          text default 'ACTIVE',
  location_name   text,
  gps             text,
  batch_id        uuid,
  created_at      timestamptz default now()
);

create table if not exists scans (
  id             uuid primary key default uuid_generate_v4(),
  qr_id          uuid not null references qr_codes(id),
  agent_id       uuid not null references profiles(id),
  painter_id     uuid references profiles(id),
  campaign_id    uuid not null references campaigns(id),
  timestamp      timestamptz default now(),
  lat            float,
  lng            float,
  points_earned  int not null,
  painter_earned float not null,
  system_revenue float not null
);

create table if not exists cashout_requests (
  id         uuid primary key default uuid_generate_v4(),
  agent_id   uuid not null references profiles(id),
  amount     float not null,
  status     text default 'PENDING',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists painter_payouts (
  id          uuid primary key default uuid_generate_v4(),
  painter_id  uuid references profiles(id),
  admin_id    uuid not null references profiles(id),
  amount      float not null,
  timestamp   timestamptz default now()
);

create table if not exists invitations (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null,
  token           uuid unique default uuid_generate_v4(),
  role            text not null check (role in ('ADMIN', 'AGENT')),
  organization_id uuid not null references organizations(id),
  expires_at      timestamptz not null,
  status          text default 'PENDING'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table organizations      enable row level security;
alter table profiles           enable row level security;
alter table campaigns          enable row level security;
alter table qr_codes           enable row level security;
alter table scans              enable row level security;
alter table cashout_requests   enable row level security;
alter table painter_payouts    enable row level security;
alter table invitations        enable row level security;

-- Helper: get current user's role
create or replace function get_my_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper: get current user's organization_id
create or replace function get_my_org()
returns uuid as $$
  select organization_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ---- Organizations ----
create policy "superadmin_all_orgs" on organizations
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_read_own_org" on organizations
  for select using (id = get_my_org());

-- ---- Profiles ----
create policy "superadmin_all_profiles" on profiles
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_read_org_profiles" on profiles
  for select using (organization_id = get_my_org() and get_my_role() = 'ADMIN');
create policy "user_read_own_profile" on profiles
  for select using (id = auth.uid());
create policy "user_update_own_profile" on profiles
  for update using (id = auth.uid());
-- Allow new profile creation on signup
create policy "allow_profile_insert" on profiles
  for insert with check (id = auth.uid());

-- ---- Campaigns ----
create policy "superadmin_all_campaigns" on campaigns
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_campaigns" on campaigns
  for all using (organization_id = get_my_org() and get_my_role() = 'ADMIN');
create policy "agent_read_campaigns" on campaigns
  for select using (get_my_role() = 'AGENT');

-- ---- QR Codes ----
create policy "superadmin_all_qr" on qr_codes
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_qr" on qr_codes
  for all using (
    get_my_role() = 'ADMIN' and
    campaign_id in (select id from campaigns where organization_id = get_my_org())
  );
create policy "agent_read_active_qr" on qr_codes
  for select using (get_my_role() = 'AGENT' and status = 'ACTIVE');

-- ---- Scans ----
create policy "superadmin_all_scans" on scans
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_scans" on scans
  for select using (
    get_my_role() = 'ADMIN' and
    campaign_id in (select id from campaigns where organization_id = get_my_org())
  );
create policy "agent_own_scans" on scans
  for select using (agent_id = auth.uid());
create policy "agent_insert_scan" on scans
  for insert with check (agent_id = auth.uid() and get_my_role() = 'AGENT');

-- ---- Cashout Requests ----
create policy "superadmin_all_cashouts" on cashout_requests
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_cashouts" on cashout_requests
  for all using (
    get_my_role() = 'ADMIN' and
    agent_id in (select id from profiles where organization_id = get_my_org())
  );
create policy "agent_own_cashouts" on cashout_requests
  for all using (agent_id = auth.uid());

-- ---- Painter Payouts ----
create policy "superadmin_all_payouts" on painter_payouts
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_payouts" on painter_payouts
  for all using (get_my_role() = 'ADMIN');

-- ---- Invitations ----
create policy "superadmin_all_invites" on invitations
  for all using (get_my_role() = 'SUPERADMIN');
create policy "admin_org_invites" on invitations
  for all using (organization_id = get_my_org() and get_my_role() = 'ADMIN');
create policy "anyone_read_invite_by_token" on invitations
  for select using (true);

-- ============================================================
-- POSTGRES FUNCTIONS
-- ============================================================

-- process_scan: atomic scan validation + recording
create or replace function process_scan(
  p_qr_id uuid,
  p_lat   float default null,
  p_lng   float default null
)
returns json as $$
declare
  v_qr            record;
  v_last_scan     record;
  v_existing      record;
  v_total_points  float;
  v_scan          record;
  v_agent_id      uuid;
  v_qr_lat        float;
  v_qr_lng        float;
begin
  v_agent_id := auth.uid();

  if v_agent_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Fetch QR with campaign
  select q.*, c.budget, c.painter_margin, c.system_revenue
  into v_qr
  from qr_codes q
  join campaigns c on c.id = q.campaign_id
  where q.id = p_qr_id;

  if not found then
    raise exception 'Invalid QR code';
  end if;
  if v_qr.status != 'ACTIVE' then
    raise exception 'QR code is not active';
  end if;
  if v_qr.expiration_date is not null and v_qr.expiration_date < now() then
    raise exception 'QR code has expired';
  end if;

  -- Rate limit: 30s between scans per agent
  select * into v_last_scan
  from scans where agent_id = v_agent_id
  order by timestamp desc limit 1;

  if found and extract(epoch from (now() - v_last_scan.timestamp)) < 30 then
    raise exception 'Scanning too fast. Please wait 30 seconds.';
  end if;

  -- Duplicate scan check
  select * into v_existing
  from scans where qr_id = p_qr_id and agent_id = v_agent_id;

  if found then
    raise exception 'You have already scanned this QR code';
  end if;

  -- Budget check
  select coalesce(sum(points_earned), 0) into v_total_points
  from scans where campaign_id = v_qr.campaign_id;

  if v_qr.budget > 0 and ((v_total_points + v_qr.reward_points) * 0.1) > v_qr.budget then
    raise exception 'Campaign budget reached';
  end if;

  -- Geo check
  if v_qr.gps is not null and p_lat is not null and p_lng is not null then
    v_qr_lat := split_part(v_qr.gps, ',', 1)::float;
    v_qr_lng := split_part(v_qr.gps, ',', 2)::float;
    if abs(v_qr_lat - p_lat) > 0.01 or abs(v_qr_lng - p_lng) > 0.01 then
      raise exception 'You are too far from the QR location';
    end if;
  end if;

  -- Record scan
  insert into scans (qr_id, agent_id, painter_id, campaign_id, lat, lng,
                     points_earned, painter_earned, system_revenue)
  values (p_qr_id, v_agent_id, v_qr.painter_id, v_qr.campaign_id,
          p_lat, p_lng, v_qr.reward_points, v_qr.painter_margin, v_qr.system_revenue)
  returning * into v_scan;

  -- Expire QR (single-use)
  update qr_codes set status = 'EXPIRED' where id = p_qr_id;

  return row_to_json(v_scan);
end;
$$ language plpgsql security definer;

-- get_analytics_overview
create or replace function get_analytics_overview(p_organization_id uuid default null)
returns json as $$
declare v_result json;
begin
  select json_build_object(
    'totalScans',         count(s.id),
    'totalRevenue',       coalesce(sum(s.system_revenue), 0),
    'totalRewardsIssued', coalesce(sum(s.points_earned), 0),
    'netProfit',          coalesce(sum(s.system_revenue) - sum(s.painter_earned), 0)
  ) into v_result
  from scans s
  join campaigns c on c.id = s.campaign_id
  where (p_organization_id is null or c.organization_id = p_organization_id);
  return v_result;
end;
$$ language plpgsql security definer stable;

-- get_user_performance
create or replace function get_user_performance()
returns json as $$
declare
  v_profile  record;
  v_stats    record;
  v_cashouts record;
begin
  select * into v_profile from profiles where id = auth.uid();

  if v_profile.role = 'AGENT' then
    select
      coalesce(sum(points_earned), 0) as total_points,
      count(*)                         as total_scans
    into v_stats
    from scans where agent_id = auth.uid();

    select coalesce(sum(amount), 0) as total_cashout
    into v_cashouts
    from cashout_requests
    where agent_id = auth.uid() and status in ('PENDING','APPROVED','PAID');

    return json_build_object(
      'totalPoints',       v_stats.total_points,
      'totalScans',        v_stats.total_scans,
      'totalCashoutValue', v_cashouts.total_cashout * 10,
      'availablePoints',   v_stats.total_points - (v_cashouts.total_cashout * 10),
      'role',              v_profile.role,
      'name',              v_profile.name
    );
  else
    return json_build_object(
      'role', v_profile.role,
      'name', v_profile.name,
      'organizationId', v_profile.organization_id
    );
  end if;
end;
$$ language plpgsql security definer stable;

-- Trigger: auto-create profile on auth.users signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'AGENT')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
