import { useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import { GameSelector } from './components/GameSelector'
import { MapGrid } from './components/MapGrid'
import { AddSessionModal } from './components/AddSessionModal'
import { MapDetail } from './components/MapDetail'
import { Leaderboard } from './components/Leaderboard'
import { Stats } from './components/Stats'
import { useSessions } from './hooks/useSessions'
import type { Game } from './types'

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
  const [selectedGame, setSelectedGame] = useState<Game>('bo1')
  const [selectedMap, setSelectedMap] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { sessions, loading, addSession, deleteSession } = useSessions()

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen" style={{ color: 'var(--text)' }}>
      <header
        className="sticky top-0 z-10 px-4 flex items-center justify-between"
        style={{
          background: 'rgba(2, 2, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          height: '48px',
        }}
      >
        <h1
          className="font-display cursor-pointer shrink-0 text-xl"
          style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em' }}
          onClick={() => setView('home')}
        >
          ZOMBIES TRACKER
        </h1>
        <nav className="flex">
          {(['home', 'leaderboard', 'stats'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="font-display px-3 text-sm transition-colors outline-none"
              style={{
                height: '48px',
                fontWeight: 600,
                color: view === v ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: view === v ? '2px solid var(--accent)' : '2px solid transparent',
                letterSpacing: '0.03em',
              }}
            >
              {NAV_LABELS[v]}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-2xl mx-auto">
        {view === 'home' && (
          <>
            <GameSelector selected={selectedGame} onChange={game => setSelectedGame(game)} />
            {loading ? (
              <p className="text-center py-12 font-score" style={{ color: 'var(--text-muted)' }}>
                Cargando...
              </p>
            ) : (
              <MapGrid
                game={selectedGame}
                sessions={sessions}
                onMapClick={mapName => {
                  setSelectedMap(mapName)
                  setView('map-detail')
                }}
              />
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
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-colors z-20"
          style={{ backgroundColor: 'var(--accent)', color: '#02020f' }}
          aria-label="Añadir partida"
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          +
        </button>
      )}

      {showModal && (
        <AddSessionModal
          game={selectedGame}
          defaultMap={selectedMap}
          onAdd={addSession}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default App
