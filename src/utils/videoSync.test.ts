import { describe, it, expect } from 'vitest'
import { pairVideosWithSessions, videoUrl, type SyncableSession, type YouTubeVideo } from './videoSync'

const video = (id: string, publishedAt: string, title = id): YouTubeVideo => ({ id, title, publishedAt })
const session = (id: string, played_at: string, video_id: string | null = null, created_at = '2026-01-01T00:00:00Z'): SyncableSession => ({
  id,
  played_at,
  created_at,
  video_id,
})

describe('pairVideosWithSessions', () => {
  it('asigna el vídeo más reciente a la última partida sin vídeo', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-09-15T18:00:00Z')],
      [session('old', '2026-09-01'), session('new', '2026-09-15')]
    )
    expect(out).toEqual([{ sessionId: 'new', video: video('v1', '2026-09-15T18:00:00Z') }])
  })

  it('no reasigna un vídeo que ya está en alguna partida', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-09-15T18:00:00Z')],
      [session('a', '2026-09-10', 'v1'), session('b', '2026-09-15')]
    )
    expect(out).toEqual([])
  })

  it('no toca partidas que ya tienen vídeo', () => {
    const out = pairVideosWithSessions(
      [video('v2', '2026-09-16T10:00:00Z')],
      [session('a', '2026-09-16', 'v1')]
    )
    expect(out).toEqual([])
  })

  it('ignora vídeos publicados antes de la partida', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-09-10T10:00:00Z')],
      [session('a', '2026-09-15')]
    )
    expect(out).toEqual([])
  })

  it('ignora vídeos publicados mucho después de la partida', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-10-30T10:00:00Z')],
      [session('a', '2026-09-15')]
    )
    expect(out).toEqual([])
  })

  it('empareja varios vídeos con varias partidas sin repetir', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-09-14T20:00:00Z'), video('v2', '2026-09-16T20:00:00Z')],
      [session('a', '2026-09-14'), session('b', '2026-09-16')]
    )
    expect(out.map(o => [o.sessionId, o.video.id])).toEqual([
      ['b', 'v2'],
      ['a', 'v1'],
    ])
  })

  it('con dos partidas el mismo día, elige la registrada más tarde', () => {
    const out = pairVideosWithSessions(
      [video('v1', '2026-09-15T22:00:00Z')],
      [session('first', '2026-09-15', null, '2026-09-15T10:00:00Z'), session('second', '2026-09-15', null, '2026-09-15T12:00:00Z')]
    )
    expect(out[0].sessionId).toBe('second')
  })
})

describe('videoUrl', () => {
  it('construye la URL de YouTube', () => {
    expect(videoUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123')
  })
})
