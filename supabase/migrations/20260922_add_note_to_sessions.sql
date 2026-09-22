-- Nota libre que el usuario adjunta a una partida desde la app.
alter table public.sessions
  add column if not exists note text;
