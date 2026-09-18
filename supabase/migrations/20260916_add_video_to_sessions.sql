-- Vídeo de YouTube asociado a una partida. Lo rellena la función
-- api/sync-youtube.ts; la app solo lo lee.
alter table public.sessions
  add column if not exists video_id text,
  add column if not exists video_url text,
  add column if not exists video_title text;

-- Un vídeo solo puede colgar de una partida.
create unique index if not exists sessions_video_id_key
  on public.sessions (video_id)
  where video_id is not null;
