-- places: user-curated list of restaurants/bars/coffee/activities
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null unique,
  category text not null check (category in ('rec', 'explore')),
  place_type text not null default 'restaurant',
  cuisine text,
  neighborhood text,
  dietary_options text,
  notes text,
  tags text[] default '{}',
  latitude double precision not null,
  longitude double precision not null,
  website text,
  price_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- cached_metadata: Google Places API responses, refreshed daily
create table if not exists cached_metadata (
  google_place_id text primary key,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);

-- RLS: public read, service-role write
alter table places enable row level security;
alter table cached_metadata enable row level security;

create policy "public_read_places" on places for select using (true);
create policy "public_read_metadata" on cached_metadata for select using (true);

create policy "service_write_places" on places for all using (auth.role() = 'service_role');
create policy "service_write_metadata" on cached_metadata for all using (auth.role() = 'service_role');

-- Index for common queries
create index if not exists idx_places_category on places (category);
create index if not exists idx_places_place_type on places (place_type);
create index if not exists idx_places_neighborhood on places (neighborhood);
