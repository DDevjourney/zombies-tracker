/**
 * Función serverless de Vercel. Consulta los últimos vídeos del canal con la
 * YouTube Data API v3 y los asigna a las partidas más recientes sin vídeo.
 *
 * Se ejecuta por el cron definido en vercel.json (Vercel envía
 * `Authorization: Bearer $CRON_SECRET`) o manualmente con esa misma cabecera.
 *
 * Variables de entorno necesarias (sin prefijo VITE_, son de servidor):
 *   YOUTUBE_API_KEY            clave de Google Cloud con YouTube Data API v3
 *   YOUTUBE_CHANNEL_ID         empieza por UC...
 *   SUPABASE_URL               misma URL que VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  clave service_role (nunca la anon)
 *   CRON_SECRET                cadena aleatoria; Vercel la usa para el cron
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { pairVideosWithSessions, videoUrl, type SyncableSession, type YouTubeVideo } from '../src/utils/videoSync'

const MAX_VIDEOS = 5

interface PlaylistItemsResponse {
  items?: Array<{
    snippet: {
      title: string
      publishedAt: string
      resourceId: { videoId: string }
    }
  }>
  error?: { message: string }
}

async function fetchLatestVideos(apiKey: string, channelId: string): Promise<YouTubeVideo[]> {
  // La lista de subidas de un canal tiene el mismo id que el canal cambiando
  // el prefijo UC por UU. Consultarla cuesta 1 unidad de cuota en vez de 100
  // que cuesta search.list.
  const uploads = 'UU' + channelId.slice(2)
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('playlistId', uploads)
  url.searchParams.set('maxResults', String(MAX_VIDEOS))
  url.searchParams.set('key', apiKey)

  const res = await fetch(url)
  const body = (await res.json()) as PlaylistItemsResponse
  if (!res.ok) throw new Error(`YouTube API: ${body.error?.message ?? res.statusText}`)

  return (body.items ?? []).map(item => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
  }))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!apiKey || !channelId || !supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Faltan variables de entorno' })
  }

  try {
    const videos = await fetchLatestVideos(apiKey, channelId)

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data, error } = await supabase
      .from('sessions')
      .select('id, played_at, created_at, video_id')
      .order('played_at', { ascending: false })
      .limit(50)
    if (error) throw error

    const assignments = pairVideosWithSessions(videos, (data ?? []) as SyncableSession[])

    for (const { sessionId, video } of assignments) {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ video_id: video.id, video_url: videoUrl(video.id), video_title: video.title })
        .eq('id', sessionId)
      if (updateError) throw updateError
    }

    return res.status(200).json({
      checked: videos.length,
      assigned: assignments.map(a => ({ session: a.sessionId, video: a.video.id, title: a.video.title })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('sync-youtube:', message)
    return res.status(500).json({ error: message })
  }
}
