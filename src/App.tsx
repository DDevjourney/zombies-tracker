import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import { GameSelector } from './components/GameSelector'
import { MapGrid, type RecordFlash } from './components/MapGrid'
import { AddSessionModal } from './components/AddSessionModal'
import { MapDetail } from './components/MapDetail'
import { Leaderboard } from './components/Leaderboard'
import { Stats } from './components/Stats'
import { BestOfMonth } from './components/BestOfMonth'
import { useSessions } from './hooks/useSessions'
import { getBestOfMonth } from './utils/stats'
import { animate, reducedMotion } from './lib/motion'
import type { Game, NewSession, Session } from './types'

type View = 'home' | 'leaderboard' | 'stats' | 'map-detail'

const NAV_LABELS: Record<string, string> = {
  home: 'Mapas',
  leaderboard: 'Ranking',
  stats: 'Stats',
}

function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('auth') === 'true'
  )
  const [view, setView] = useState<View>('home')
  const [selectedGame, setSelectedGame] = useState<Game>(() => {
    try {
      const stored = localStorage.getItem('game')
      return stored === 'bo1' || stored === 'bo2' ? stored : 'bo1'
    } catch {
      return 'bo1'
    }
  })
  const [selectedMap, setSelectedMap] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [recordFlash, setRecordFlash] = useState<RecordFlash | null>(null)

  const mainRef = useRef<HTMLElement>(null)

  const { sessions, loading, addSession, updateSession, deleteSession } = useSessions()

  useEffect(() => {
    try {
      localStorage.setItem('game', selectedGame)
    } catch {
      /* storage unavailable */
    }
  }, [selectedGame])

  // The record celebration is a one-shot: clear it so remounting cards
  // (e.g. switching game) do not replay it.
  useEffect(() => {
    if (!recordFlash) return
    const t = window.setTimeout(() => setRecordFlash(null), 2000)
    return () => clearTimeout(t)
  }, [recordFlash])

  // Fade + slide the new view in whenever the route changes.
  useLayoutEffect(() => {
    if (!authed || !mainRef.current || reducedMotion()) return
    animate(mainRef.current, { opacity: [0, 1], translateY: [10, 0], duration: 280, ease: 'outCubic' })
  }, [view, authed])

  const bestOfMonth = getBestOfMonth(sessions, selectedGame)

  async function handleAdd(session: NewSession) {
    const result = await addSession(session)
    if (result.isRecord) setRecordFlash({ map: session.map, ts: Date.now() })
    return result
  }

  async function handleUpdate(id: string, changes: NewSession) {
    const result = await updateSession(id, changes)
    if (result.isRecord) setRecordFlash({ map: changes.map, ts: Date.now() })
    return result
  }

  function openEdit(session: Session) {
    setEditingSession(session)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingSession(null)
  }


  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen" style={{ color: 'var(--text)' }}>
      <header
        className="sticky top-0 z-10 px-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 8, 10, 0.92), rgba(7, 6, 10, 0.85))',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 0 rgba(232,160,48,0.12), 0 10px 30px rgba(0,0,0,0.5)',
          height: '52px',
        }}
      >
        <button
          className="font-display shrink-0 text-xl flex items-center gap-2 outline-none"
          style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em' }}
          onClick={() => setView('home')}
          aria-label="Ir a mapas"
        >
          <span
            aria-hidden
            className="inline-block"
            style={{ width: 8, height: 8, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)', transform: 'rotate(45deg)' }}
          />
          Zombies Tracker
        </button>
        <nav className="flex" aria-label="Secciones">
          {(['home', 'leaderboard', 'stats'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="nav-tab outline-none"
              aria-current={view === v ? 'page' : undefined}
            >
              {NAV_LABELS[v]}
            </button>
          ))}
        </nav>
      </header>

      <main ref={mainRef} className="max-w-2xl mx-auto pb-24">
        {view === 'home' && (
          <>
            <GameSelector selected={selectedGame} onChange={game => setSelectedGame(game)} />
            {loading ? (
              <p className="text-center py-12 font-score" style={{ color: 'var(--text-muted)' }}>
                Cargando...
              </p>
            ) : (
              <>
                {bestOfMonth && (
                  <div className="px-4 pt-4">
                    <BestOfMonth
                      session={bestOfMonth}
                      onClick={() => {
                        setSelectedMap(bestOfMonth.map)
                        setView('map-detail')
                      }}
                    />
                  </div>
                )}
                <MapGrid
                  game={selectedGame}
                  sessions={sessions}
                  onMapClick={mapName => {
                    setSelectedMap(mapName)
                    setView('map-detail')
                  }}
                  recordFlash={recordFlash}
                />
              </>
            )}
          </>
        )}

        {view === 'map-detail' && selectedMap && (
          <MapDetail
            game={selectedGame}
            mapName={selectedMap}
            sessions={sessions}
            onBack={() => setView('home')}
            onAddSession={() => setShowModal(true)}
            onEditSession={openEdit}
            onDeleteSession={deleteSession}
          />
        )}

        {view === 'leaderboard' && (
          <>
            <GameSelector selected={selectedGame} onChange={setSelectedGame} />
            <Leaderboard game={selectedGame} sessions={sessions} />
          </>
        )}

        {view === 'stats' && (
          <>
            <GameSelector selected={selectedGame} onChange={setSelectedGame} />
            <Stats game={selectedGame} sessions={sessions} />
          </>
        )}
      </main>

      {(view === 'home' || view === 'map-detail') && !loading && (
        <button
          onClick={() => { setShowModal(true) }}
          className="btn btn-primary chamfer fixed right-5 w-16 h-16 z-20"
          style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))', padding: 0, borderRadius: 0 }}
          aria-label="Añadir partida"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {showModal && (
        <AddSessionModal
          game={selectedGame}
          defaultMap={selectedMap}
          onAdd={handleAdd}
          editing={editingSession}
          onUpdate={handleUpdate}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default App
