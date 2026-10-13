-- Lista negra: jugadores con los que no queremos jugar.
create table if not exists public.blacklist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Un nombre solo puede aparecer una vez (sin distinguir mayúsculas).
create unique index if not exists blacklist_name_key
  on public.blacklist (lower(name));
