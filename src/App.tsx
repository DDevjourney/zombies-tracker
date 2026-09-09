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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
        <h1
          className="text-orange-400 font-bold text-xl cursor-pointer"
          onClick={() => setView('home')}
        >
          Zombies Tracker
        </h1>
        <nav className="flex gap-1">
          {(['home', 'leaderboard', 'stats'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {v === 'home' ? 'Mapas' : v === 'leaderboard' ? 'Ranking' : 'Stats'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-2xl mx-auto">
        {view === 'home' && (
          <>
            <GameSelector
              selected={selectedGame}
              onChange={game => setSelectedGame(game)}
            />
            {loading ? (
              <p className="text-center text-gray-500 py-12">Cargando...</p>
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
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-3xl font-bold shadow-lg flex items-center justify-center transition-colors z-20"
          aria-label="Añadir partida"
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
