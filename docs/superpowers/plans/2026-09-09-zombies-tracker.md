# Zombies Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una web privada para Carlos y Moi donde registran récords de zombies por mapa en Black Ops 1 y 2, con historial, leaderboard y estadísticas.

**Architecture:** SPA con React 18 + TypeScript + Vite. Toda la lógica de negocio (calcular récords, estadísticas) vive en funciones puras en el cliente (`src/utils/stats.ts`). Un custom hook (`useSessions`) conecta esa lógica con Supabase. La autenticación es una contraseña compartida en variable de entorno comparada en el cliente.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, Supabase JS Client v2, Vitest.

## Global Constraints

- Node.js >= 18
- React 18 (no React 19)
- Tailwind CSS v3 (no v4)
- `@supabase/supabase-js` v2
- Todos los textos de UI en español
- Los mapas de Grief se denominan con sufijo "(Pena)" — ej: `TranZit (Pena)`
- No hay distinción de jugadores — el récord es compartido
- Contraseña en `VITE_APP_PASSWORD`, URL Supabase en `VITE_SUPABASE_URL`, clave anon en `VITE_SUPABASE_ANON_KEY`

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/types/index.ts` | Tipos TypeScript compartidos (`Game`, `Session`, `NewSession`, `MapInfo`) |
| `src/data/maps.ts` | Lista estática de mapas por juego |
| `src/lib/supabase.ts` | Cliente singleton de Supabase |
| `src/utils/stats.ts` | Funciones puras: calcular récords, historial, stats, leaderboard |
| `src/utils/stats.test.ts` | Tests de Vitest para las funciones puras |
| `src/hooks/useSessions.ts` | Custom hook: fetch de sesiones + addSession con Supabase |
| `src/components/PasswordGate.tsx` | Pantalla de login con contraseña compartida |
| `src/components/GameSelector.tsx` | Tabs BO1 / BO2 |
| `src/components/MapCard.tsx` | Tarjeta de un mapa con su récord |
| `src/components/MapGrid.tsx` | Grid de tarjetas de mapa |
| `src/components/AddSessionModal.tsx` | Modal para añadir una partida |
| `src/components/MapDetail.tsx` | Vista de mapa: récord + historial |
| `src/components/Leaderboard.tsx` | Ranking de mapas por ronda |
| `src/components/Stats.tsx` | Estadísticas globales |
| `src/App.tsx` | Shell de la app: auth gate, navegación, estado global |

---

## Task 1: Scaffold del proyecto + tabla en Supabase

**Files:**
- Create: `package.json` (generado por Vite)
- Create: `vite.config.ts`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`
- Supabase: tabla `sessions` creada vía dashboard

**Interfaces:**
- Produce: proyecto Vite funcionando en `http://localhost:5173`
- Produce: tabla `sessions` en Supabase lista para recibir datos

- [ ] **Step 1: Crear el proyecto con Vite**

Ejecutar en `C:\Proyectos\JavaScript\Zombies` (el directorio ya existe con un `index.html`, borrarlo primero o iniciar en un subdirectorio vacío — como el directorio es el proyecto, eliminar el `index.html` vacío):

```bash
del index.html
npm create vite@latest . -- --template react-ts
```

Cuando pregunte si continuar en el directorio existente, confirmar con `y`.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install @supabase/supabase-js
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Configurar Tailwind**

Reemplazar el contenido de `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Reemplazar el contenido de `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Configurar Vitest en vite.config.ts**

Reemplazar el contenido de `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Crear `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Crear los archivos de entorno**

Crear `.env` (nunca hacer commit de este archivo):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_PASSWORD=vuestra_contraseña_aqui
```

Crear `.env.example` (sí se puede hacer commit):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_PASSWORD=
```

Verificar que `.gitignore` incluye `.env` (Vite lo añade automáticamente).

- [ ] **Step 6: Crear la tabla en Supabase**

1. Ir a [supabase.com](https://supabase.com), crear un proyecto nuevo (o usar uno existente).
2. Ir a **SQL Editor** y ejecutar:

```sql
create table sessions (
  id         uuid        primary key default gen_random_uuid(),
  game       text        not null check (game in ('bo1', 'bo2')),
  map        text        not null,
  round      integer     not null check (round > 0),
  played_at  date        not null,
  created_at timestamptz not null default now()
);

alter table sessions enable row level security;

create policy "allow all for anon"
  on sessions for all
  using (true)
  with check (true);
```

3. En **Project Settings > API**, copiar la `Project URL` y la `anon public` key.
4. Pegar esos valores en el `.env`.

- [ ] **Step 7: Verificar que el proyecto arranca**

```bash
npm run dev
```

Abrir `http://localhost:5173`. Debe mostrar la pantalla por defecto de Vite+React.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold React+TS+Vite+Tailwind+Supabase"
```

---

## Task 2: Tipos y datos de mapas

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/maps.ts`

**Interfaces:**
- Produce: tipo `Game = 'bo1' | 'bo2'`
- Produce: interfaz `MapInfo { name: string; game: Game }`
- Produce: interfaz `Session { id, game, map, round, played_at, created_at }`
- Produce: tipo `NewSession = Omit<Session, 'id' | 'created_at'>`
- Produce: `MAPS: Record<Game, MapInfo[]>` con todos los mapas

- [ ] **Step 1: Crear src/types/index.ts**

```ts
export type Game = 'bo1' | 'bo2'

export interface MapInfo {
  name: string
  game: Game
}

export interface Session {
  id: string
  game: Game
  map: string
  round: number
  played_at: string
  created_at: string
}

export type NewSession = Omit<Session, 'id' | 'created_at'>
```

- [ ] **Step 2: Crear src/data/maps.ts**

```ts
import type { Game, MapInfo } from '../types'

export const MAPS: Record<Game, MapInfo[]> = {
  bo1: [
    { name: 'Nacht der Untoten', game: 'bo1' },
    { name: 'Verrückt', game: 'bo1' },
    { name: 'Shi No Numa', game: 'bo1' },
    { name: 'Der Riese', game: 'bo1' },
    { name: 'Kino der Toten', game: 'bo1' },
    { name: 'Five', game: 'bo1' },
    { name: 'Ascension', game: 'bo1' },
    { name: 'Call of the Dead', game: 'bo1' },
    { name: 'Shangri-La', game: 'bo1' },
    { name: 'Moon', game: 'bo1' },
  ],
  bo2: [
    { name: 'TranZit', game: 'bo2' },
    { name: 'Pueblo', game: 'bo2' },
    { name: 'Granja', game: 'bo2' },
    { name: 'Bus Depot', game: 'bo2' },
    { name: 'Die Rise', game: 'bo2' },
    { name: 'Mob of the Dead', game: 'bo2' },
    { name: 'Buried', game: 'bo2' },
    { name: 'Origins', game: 'bo2' },
    { name: 'Nuketown Zombies', game: 'bo2' },
    { name: 'Mob of the Dead (Pena)', game: 'bo2' },
    { name: 'Pueblo (Pena)', game: 'bo2' },
    { name: 'Granja (Pena)', game: 'bo2' },
    { name: 'TranZit (Pena)', game: 'bo2' },
  ],
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/data/maps.ts
git commit -m "feat: tipos TypeScript y datos estáticos de mapas"
```

---

## Task 3: Cliente Supabase

**Files:**
- Create: `src/lib/supabase.ts`

**Interfaces:**
- Consume: variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Produce: `supabase` — cliente singleton exportado, usado por `useSessions`

- [ ] **Step 1: Crear src/lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Verificar que TypeScript compila sin errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: cliente Supabase"
```

---

## Task 4: Funciones puras de estadísticas (con tests)

**Files:**
- Create: `src/utils/stats.ts`
- Create: `src/utils/stats.test.ts`

**Interfaces:**
- Consume: `Session`, `Game` de `../types`
- Produce: `getRecord(sessions, game, map): Session | null`
- Produce: `getHistory(sessions, game, map): Session[]`
- Produce: `isNewRecord(sessions, game, map, round): boolean`
- Produce: `getFavoriteMap(sessions, game): string | null`
- Produce: `getBestGlobalRecord(sessions, game): { map: string; round: number } | null`
- Produce: `getTotalSessions(sessions, game): number`
- Produce: `getLeaderboard(sessions, game, maps): Array<{ map: string; record: Session | null }>`

- [ ] **Step 1: Escribir los tests primero**

Crear `src/utils/stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  getRecord,
  getHistory,
  isNewRecord,
  getFavoriteMap,
  getBestGlobalRecord,
  getTotalSessions,
  getLeaderboard,
} from './stats'
import type { Session } from '../types'

const S = (overrides: Partial<Session> & Pick<Session, 'map' | 'round' | 'played_at'>): Session => ({
  id: Math.random().toString(),
  game: 'bo1',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const sessions: Session[] = [
  S({ map: 'Kino der Toten', round: 25, played_at: '2024-01-01' }),
  S({ map: 'Kino der Toten', round: 42, played_at: '2024-02-01' }),
  S({ map: 'Kino der Toten', round: 10, played_at: '2024-03-01' }),
  S({ map: 'Moon', round: 15, played_at: '2024-01-15' }),
  S({ map: 'TranZit', round: 10, played_at: '2024-01-20', game: 'bo2' }),
]

describe('getRecord', () => {
  it('devuelve la sesión con la ronda más alta del mapa', () => {
    const result = getRecord(sessions, 'bo1', 'Kino der Toten')
    expect(result?.round).toBe(42)
  })

  it('devuelve null si no hay sesiones para ese mapa', () => {
    expect(getRecord(sessions, 'bo1', 'Five')).toBeNull()
  })

  it('no mezcla sesiones de distintos juegos', () => {
    expect(getRecord(sessions, 'bo1', 'TranZit')).toBeNull()
  })
})

describe('getHistory', () => {
  it('devuelve las sesiones de un mapa ordenadas por fecha descendente', () => {
    const result = getHistory(sessions, 'bo1', 'Kino der Toten')
    expect(result).toHaveLength(3)
    expect(result[0].played_at).toBe('2024-03-01')
    expect(result[1].played_at).toBe('2024-02-01')
    expect(result[2].played_at).toBe('2024-01-01')
  })

  it('devuelve array vacío si no hay sesiones', () => {
    expect(getHistory(sessions, 'bo1', 'Five')).toEqual([])
  })
})

describe('isNewRecord', () => {
  it('devuelve true si la ronda supera el récord actual', () => {
    expect(isNewRecord(sessions, 'bo1', 'Kino der Toten', 50)).toBe(true)
  })

  it('devuelve false si la ronda no supera el récord', () => {
    expect(isNewRecord(sessions, 'bo1', 'Kino der Toten', 42)).toBe(false)
  })

  it('devuelve true si no hay récord previo', () => {
    expect(isNewRecord(sessions, 'bo1', 'Five', 1)).toBe(true)
  })
})

describe('getFavoriteMap', () => {
  it('devuelve el mapa con más sesiones', () => {
    expect(getFavoriteMap(sessions, 'bo1')).toBe('Kino der Toten')
  })

  it('devuelve null si no hay sesiones', () => {
    expect(getFavoriteMap([], 'bo1')).toBeNull()
  })
})

describe('getBestGlobalRecord', () => {
  it('devuelve el mapa y ronda del récord más alto de todos los mapas', () => {
    expect(getBestGlobalRecord(sessions, 'bo1')).toEqual({
      map: 'Kino der Toten',
      round: 42,
    })
  })

  it('devuelve null si no hay sesiones', () => {
    expect(getBestGlobalRecord([], 'bo1')).toBeNull()
  })
})

describe('getTotalSessions', () => {
  it('cuenta solo las sesiones del juego indicado', () => {
    expect(getTotalSessions(sessions, 'bo1')).toBe(4)
    expect(getTotalSessions(sessions, 'bo2')).toBe(1)
  })
})

describe('getLeaderboard', () => {
  it('ordena los mapas por récord descendente, sin récord al final', () => {
    const maps = ['Moon', 'Kino der Toten', 'Five']
    const result = getLeaderboard(sessions, 'bo1', maps)
    expect(result[0].map).toBe('Kino der Toten')
    expect(result[0].record?.round).toBe(42)
    expect(result[1].map).toBe('Moon')
    expect(result[1].record?.round).toBe(15)
    expect(result[2].map).toBe('Five')
    expect(result[2].record).toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar los tests para verificar que fallan**

```bash
npx vitest run src/utils/stats.test.ts
```

Esperado: todos los tests FAIL con "Cannot find module './stats'".

- [ ] **Step 3: Implementar src/utils/stats.ts**

```ts
import type { Game, Session } from '../types'

export function getRecord(sessions: Session[], game: Game, map: string): Session | null {
  const mapSessions = sessions.filter(s => s.game === game && s.map === map)
  if (mapSessions.length === 0) return null
  return mapSessions.reduce((best, s) => (s.round > best.round ? s : best))
}

export function getHistory(sessions: Session[], game: Game, map: string): Session[] {
  return sessions
    .filter(s => s.game === game && s.map === map)
    .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
}

export function isNewRecord(sessions: Session[], game: Game, map: string, round: number): boolean {
  const record = getRecord(sessions, game, map)
  return record === null || round > record.round
}

export function getFavoriteMap(sessions: Session[], game: Game): string | null {
  const gameSessions = sessions.filter(s => s.game === game)
  if (gameSessions.length === 0) return null
  const counts: Record<string, number> = {}
  for (const s of gameSessions) {
    counts[s.map] = (counts[s.map] ?? 0) + 1
  }
  return Object.entries(counts).reduce(
    (best, [map, count]) => (count > best[1] ? [map, count] : best),
    ['', 0] as [string, number]
  )[0]
}

export function getBestGlobalRecord(
  sessions: Session[],
  game: Game
): { map: string; round: number } | null {
  const gameSessions = sessions.filter(s => s.game === game)
  if (gameSessions.length === 0) return null
  const best = gameSessions.reduce((b, s) => (s.round > b.round ? s : b))
  return { map: best.map, round: best.round }
}

export function getTotalSessions(sessions: Session[], game: Game): number {
  return sessions.filter(s => s.game === game).length
}

export function getLeaderboard(
  sessions: Session[],
  game: Game,
  maps: string[]
): Array<{ map: string; record: Session | null }> {
  return maps
    .map(map => ({ map, record: getRecord(sessions, game, map) }))
    .sort((a, b) => {
      if (a.record === null && b.record === null) return 0
      if (a.record === null) return 1
      if (b.record === null) return -1
      return b.record.round - a.record.round
    })
}
```

- [ ] **Step 4: Ejecutar los tests para verificar que pasan**

```bash
npx vitest run src/utils/stats.test.ts
```

Esperado: todos los tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/stats.ts src/utils/stats.test.ts
git commit -m "feat: funciones puras de estadísticas con tests"
```

---

## Task 5: Hook useSessions

**Files:**
- Create: `src/hooks/useSessions.ts`

**Interfaces:**
- Consume: `supabase` de `../lib/supabase`
- Consume: `isNewRecord` de `../utils/stats`
- Consume: `Session`, `NewSession`, `Game` de `../types`
- Produce: hook `useSessions()` que retorna `{ sessions: Session[], loading: boolean, addSession: (s: NewSession) => Promise<{ isRecord: boolean }> }`

- [ ] **Step 1: Crear src/hooks/useSessions.ts**

```ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isNewRecord } from '../utils/stats'
import type { Session, NewSession } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar sesiones:', error)
        return
      }
      setSessions(data ?? [])
      setLoading(false)
    }

    fetchSessions()
  }, [])

  const addSession = useCallback(
    async (newSession: NewSession): Promise<{ isRecord: boolean }> => {
      const willBeRecord = isNewRecord(sessions, newSession.game, newSession.map, newSession.round)

      const { data, error } = await supabase
        .from('sessions')
        .insert(newSession)
        .select()
        .single()

      if (error) throw error

      setSessions(prev => [data as Session, ...prev])
      return { isRecord: willBeRecord }
    },
    [sessions]
  )

  return { sessions, loading, addSession }
}
```

- [ ] **Step 2: Verificar que TypeScript compila sin errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSessions.ts
git commit -m "feat: hook useSessions con Supabase"
```

---

## Task 6: PasswordGate + App shell

**Files:**
- Create: `src/components/PasswordGate.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx` (añadir import de index.css si no está)

**Interfaces:**
- Consume: `VITE_APP_PASSWORD` de `import.meta.env`
- Produce: componente `PasswordGate({ onSuccess: () => void })`
- Produce: `App` con auth gate funcional; cuando autenticado muestra "Autenticado" como placeholder

- [ ] **Step 1: Crear src/components/PasswordGate.tsx**

```tsx
import { useState, type FormEvent } from 'react'

interface PasswordGateProps {
  onSuccess: () => void
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (value === import.meta.env.VITE_APP_PASSWORD) {
      sessionStorage.setItem('auth', 'true')
      onSuccess()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
        <h1 className="text-white text-2xl font-bold text-center">Zombies Tracker</h1>
        <input
          type="password"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Contraseña"
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-orange-500"
          autoFocus
        />
        {error && (
          <p className="text-red-400 text-sm text-center">Contraseña incorrecta</p>
        )}
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Reemplazar src/App.tsx con el shell inicial**

```tsx
import { useState } from 'react'
import { PasswordGate } from './components/PasswordGate'

function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('auth') === 'true'
  )

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Autenticado ✓ — aquí irá la app</p>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Verificar que src/main.tsx importa index.css**

Abrir `src/main.tsx`. Debe contener la línea:

```tsx
import './index.css'
```

Si no está, añadirla antes de `import App`.

- [ ] **Step 4: Arrancar la app y probar el login**

```bash
npm run dev
```

- Abrir `http://localhost:5173`.
- Debe aparecer la pantalla de login con fondo negro.
- Escribir una contraseña incorrecta → debe mostrar "Contraseña incorrecta".
- Escribir la contraseña correcta (la del `.env`) → debe mostrar "Autenticado ✓".
- Recargar la página → debe seguir autenticado (sessionStorage).
- Abrir la pestaña en modo incógnito → debe pedir contraseña de nuevo.

- [ ] **Step 5: Commit**

```bash
git add src/components/PasswordGate.tsx src/App.tsx src/main.tsx
git commit -m "feat: pantalla de login con contraseña compartida"
```

---

## Task 7: GameSelector + MapCard + MapGrid

**Files:**
- Create: `src/components/GameSelector.tsx`
- Create: `src/components/MapCard.tsx`
- Create: `src/components/MapGrid.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consume: `Game`, `Session` de `../types`
- Consume: `MAPS` de `../data/maps`
- Consume: `getRecord` de `../utils/stats`
- Produce: `GameSelector({ selected: Game, onChange: (g: Game) => void })`
- Produce: `MapCard({ mapName: string, record: Session | null, onClick: () => void })`
- Produce: `MapGrid({ game: Game, sessions: Session[], onMapClick: (map: string) => void })`

- [ ] **Step 1: Crear src/components/GameSelector.tsx**

```tsx
import type { Game } from '../types'

interface GameSelectorProps {
  selected: Game
  onChange: (game: Game) => void
}

export function GameSelector({ selected, onChange }: GameSelectorProps) {
  return (
    <div className="flex gap-4 justify-center p-4">
      {(['bo1', 'bo2'] as Game[]).map(game => (
        <button
          key={game}
          onClick={() => onChange(game)}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
            selected === game
              ? 'bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Crear src/components/MapCard.tsx**

```tsx
import type { Session } from '../types'

interface MapCardProps {
  mapName: string
  record: Session | null
  onClick: () => void
}

export function MapCard({ mapName, record, onClick }: MapCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-orange-500 transition-colors w-full"
    >
      <h3 className="text-white font-bold text-base mb-2 leading-tight">{mapName}</h3>
      {record ? (
        <div>
          <p className="text-orange-400 font-mono text-3xl font-bold">R{record.round}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(record.played_at).toLocaleDateString('es-ES')}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">Sin récord aún</p>
      )}
    </button>
  )
}
```

- [ ] **Step 3: Crear src/components/MapGrid.tsx**

```tsx
import { MapCard } from './MapCard'
import { getRecord } from '../utils/stats'
import { MAPS } from '../data/maps'
import type { Game, Session } from '../types'

interface MapGridProps {
  game: Game
  sessions: Session[]
  onMapClick: (mapName: string) => void
}

export function MapGrid({ game, sessions, onMapClick }: MapGridProps) {
  const maps = MAPS[game]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {maps.map(map => (
        <MapCard
          key={map.name}
          mapName={map.name}
          record={getRecord(sessions, game, map.name)}
          onClick={() => onMapClick(map.name)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Actualizar src/App.tsx para mostrar el grid**

```tsx
import { useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import { GameSelector } from './components/GameSelector'
import { MapGrid } from './components/MapGrid'
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

  const { sessions, loading } = useSessions()

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-950 z-10">
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

        {view === 'map-detail' && (
          <p className="text-center text-gray-500 py-12">
            Detalle de {selectedMap} — próxima tarea
          </p>
        )}

        {view === 'leaderboard' && (
          <p className="text-center text-gray-500 py-12">Ranking — próxima tarea</p>
        )}

        {view === 'stats' && (
          <p className="text-center text-gray-500 py-12">Stats — próxima tarea</p>
        )}
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 5: Probar en el navegador**

Con `npm run dev` corriendo:
- Entrar con la contraseña → ver el header con navegación.
- Ver el grid de mapas de BO1 con "Sin récord aún" en todas las tarjetas.
- Clicar en "Black Ops 2" → ver los 13 mapas de BO2.
- Clicar en "Ranking" y "Stats" → ver los placeholders.
- Clicar en una tarjeta → ver el placeholder de detalle.

- [ ] **Step 6: Commit**

```bash
git add src/components/GameSelector.tsx src/components/MapCard.tsx src/components/MapGrid.tsx src/App.tsx
git commit -m "feat: GameSelector, MapCard y MapGrid"
```

---

## Task 8: AddSessionModal

**Files:**
- Create: `src/components/AddSessionModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consume: `useSessions().addSession` — `(s: NewSession) => Promise<{ isRecord: boolean }>`
- Consume: `MAPS` de `../data/maps`
- Consume: `Game`, `NewSession` de `../types`
- Produce: `AddSessionModal({ game: Game, defaultMap: string | null, onAdd: (s: NewSession) => Promise<{ isRecord: boolean }>, onClose: () => void })`

- [ ] **Step 1: Crear src/components/AddSessionModal.tsx**

```tsx
import { useState, type FormEvent } from 'react'
import { MAPS } from '../data/maps'
import type { Game, NewSession } from '../types'

interface AddSessionModalProps {
  game: Game
  defaultMap: string | null
  onAdd: (session: NewSession) => Promise<{ isRecord: boolean }>
  onClose: () => void
}

export function AddSessionModal({ game, defaultMap, onAdd, onClose }: AddSessionModalProps) {
  const maps = MAPS[game]
  const [map, setMap] = useState(defaultMap ?? maps[0].name)
  const [round, setRound] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [newRecord, setNewRecord] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savedRound, setSavedRound] = useState(0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await onAdd({ game, map, round: Number(round), played_at: date })
      setSavedRound(Number(round))
      if (result.isRecord) {
        setNewRecord(true)
        setTimeout(onClose, 2500)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Error al guardar la partida:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-700">
        {newRecord ? (
          <div className="text-center py-8">
            <p className="text-orange-400 text-3xl font-bold mb-2">¡Nuevo récord!</p>
            <p className="text-white text-xl font-mono">Ronda {savedRound}</p>
            <p className="text-gray-500 mt-1">{map}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-white text-xl font-bold">Añadir partida</h2>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Mapa</label>
              <select
                value={map}
                onChange={e => setMap(e.target.value)}
                className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:border-orange-500"
              >
                {maps.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Ronda alcanzada</label>
              <input
                type="number"
                min={1}
                value={round}
                onChange={e => setRound(e.target.value)}
                placeholder="Ej: 25"
                required
                className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !round}
                className="flex-1 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar src/App.tsx para incluir el modal y el botón "+"**

Añadir los siguientes imports al App.tsx del task anterior:

```tsx
import { AddSessionModal } from './components/AddSessionModal'
```

Añadir al estado del componente App (dentro de la función, junto a los otros `useState`):

```tsx
const [showModal, setShowModal] = useState(false)
```

Cambiar la desestructuración de `useSessions` para incluir `addSession`:

```tsx
const { sessions, loading, addSession } = useSessions()
```

Añadir el botón "+" flotante y el modal al JSX, justo antes del cierre del `</div>` principal:

```tsx
        {/* Botón flotante para añadir partida (solo en vista home) */}
        {view === 'home' && !loading && (
          <button
            onClick={() => { setSelectedMap(null); setShowModal(true) }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-3xl font-bold shadow-lg flex items-center justify-center transition-colors z-20"
            aria-label="Añadir partida"
          >
            +
          </button>
        )}

        {/* Modal de añadir partida */}
        {showModal && (
          <AddSessionModal
            game={selectedGame}
            defaultMap={selectedMap}
            onAdd={addSession}
            onClose={() => setShowModal(false)}
          />
        )}
```

El App.tsx completo después de este task:

```tsx
import { useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import { GameSelector } from './components/GameSelector'
import { MapGrid } from './components/MapGrid'
import { AddSessionModal } from './components/AddSessionModal'
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

  const { sessions, loading, addSession } = useSessions()

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-950 z-10">
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

        {view === 'map-detail' && (
          <p className="text-center text-gray-500 py-12">
            Detalle de {selectedMap} — próxima tarea
          </p>
        )}

        {view === 'leaderboard' && (
          <p className="text-center text-gray-500 py-12">Ranking — próxima tarea</p>
        )}

        {view === 'stats' && (
          <p className="text-center text-gray-500 py-12">Stats — próxima tarea</p>
        )}
      </main>

      {view === 'home' && !loading && (
        <button
          onClick={() => { setSelectedMap(null); setShowModal(true) }}
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
```

- [ ] **Step 3: Probar en el navegador**

Con `npm run dev` corriendo:
- Clicar el botón "+" → debe abrirse el modal.
- Seleccionar un mapa, introducir una ronda (ej: 25) y una fecha → clicar "Guardar".
- Si es el primer récord en ese mapa → debe aparecer "¡Nuevo récord!" durante 2.5 segundos.
- Cerrar el modal → la tarjeta del mapa debe mostrar la ronda guardada.
- Añadir otra partida en el mismo mapa con una ronda menor → debe cerrarse sin mensaje.
- Añadir otra partida con una ronda mayor → debe mostrar "¡Nuevo récord!" de nuevo.
- Verificar en el dashboard de Supabase que las filas aparecen en la tabla `sessions`.

- [ ] **Step 4: Commit**

```bash
git add src/components/AddSessionModal.tsx src/App.tsx
git commit -m "feat: modal para añadir partida con detección de nuevo récord"
```

---

## Task 9: MapDetail

**Files:**
- Create: `src/components/MapDetail.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consume: `getRecord`, `getHistory` de `../utils/stats`
- Consume: `Game`, `Session` de `../types`
- Produce: `MapDetail({ game: Game, mapName: string, sessions: Session[], onBack: () => void, onAddSession: () => void })`

- [ ] **Step 1: Crear src/components/MapDetail.tsx**

```tsx
import { getRecord, getHistory } from '../utils/stats'
import type { Game, Session } from '../types'

interface MapDetailProps {
  game: Game
  mapName: string
  sessions: Session[]
  onBack: () => void
  onAddSession: () => void
}

export function MapDetail({ game, mapName, sessions, onBack, onAddSession }: MapDetailProps) {
  const record = getRecord(sessions, game, mapName)
  const history = getHistory(sessions, game, mapName)

  return (
    <div>
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ←
        </button>
        <h2 className="text-white text-xl font-bold">{mapName}</h2>
      </div>

      <div className="p-4">
        {record ? (
          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-orange-500/40">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Récord actual</p>
            <p className="text-orange-400 font-mono text-5xl font-bold">R{record.round}</p>
            <p className="text-gray-500 text-sm mt-2">
              {new Date(record.played_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-6 mb-6 text-center border border-gray-800">
            <p className="text-gray-500">Sin récord en este mapa todavía</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Historial ({history.length})
          </h3>
          <button
            onClick={onAddSession}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors"
          >
            + Añadir
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay partidas registradas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map(session => {
              const isRecord = session.id === record?.id
              return (
                <div
                  key={session.id}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    isRecord
                      ? 'bg-orange-500/15 border border-orange-500/40'
                      : 'bg-gray-900 border border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-white">
                      R{session.round}
                    </span>
                    {isRecord && (
                      <span className="text-xs text-orange-400 font-semibold uppercase tracking-wide">
                        Récord
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(session.played_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar src/App.tsx para usar MapDetail**

Añadir el import:

```tsx
import { MapDetail } from './components/MapDetail'
```

Reemplazar el bloque `{view === 'map-detail' && ...}` con:

```tsx
        {view === 'map-detail' && selectedMap && (
          <MapDetail
            game={selectedGame}
            mapName={selectedMap}
            sessions={sessions}
            onBack={() => setView('home')}
            onAddSession={() => setShowModal(true)}
          />
        )}
```

También actualizar el botón "+" para que aparezca también en la vista `map-detail`:

```tsx
      {(view === 'home' || view === 'map-detail') && !loading && (
        <button
          onClick={() => { setShowModal(true) }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-3xl font-bold shadow-lg flex items-center justify-center transition-colors z-20"
          aria-label="Añadir partida"
        >
          +
        </button>
      )}
```

- [ ] **Step 3: Probar en el navegador**

- Clicar en una tarjeta de mapa con récord → ver la vista de detalle con el récord destacado y el historial.
- Clicar en una tarjeta sin récord → ver el mensaje "Sin récord en este mapa todavía".
- Clicar "← " → volver al grid.
- Clicar "+ Añadir" desde la vista de detalle → debe abrir el modal con ese mapa preseleccionado.
- Guardar una partida → el historial debe actualizarse inmediatamente.

- [ ] **Step 4: Commit**

```bash
git add src/components/MapDetail.tsx src/App.tsx
git commit -m "feat: vista de detalle de mapa con historial"
```

---

## Task 10: Leaderboard

**Files:**
- Create: `src/components/Leaderboard.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consume: `getLeaderboard` de `../utils/stats`
- Consume: `MAPS` de `../data/maps`
- Consume: `Game`, `Session` de `../types`
- Produce: `Leaderboard({ game: Game, sessions: Session[] })`

- [ ] **Step 1: Crear src/components/Leaderboard.tsx**

```tsx
import { getLeaderboard } from '../utils/stats'
import { MAPS } from '../data/maps'
import type { Game, Session } from '../types'

interface LeaderboardProps {
  game: Game
  sessions: Session[]
}

const POSITION_COLORS: Record<number, string> = {
  0: 'text-yellow-400',
  1: 'text-gray-300',
  2: 'text-orange-600',
}

export function Leaderboard({ game, sessions }: LeaderboardProps) {
  const mapNames = MAPS[game].map(m => m.name)
  const entries = getLeaderboard(sessions, game, mapNames)

  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold mb-4">Clasificación</h2>

      {entries.every(e => e.record === null) && (
        <p className="text-gray-600 text-center py-8">
          No hay partidas registradas en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'} todavía
        </p>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <div
            key={entry.map}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
              entry.record ? 'bg-gray-900' : 'bg-gray-900/50'
            }`}
          >
            <span
              className={`font-bold text-lg w-8 text-center ${
                POSITION_COLORS[index] ?? 'text-gray-600'
              }`}
            >
              #{index + 1}
            </span>
            <span className={`flex-1 ${entry.record ? 'text-white' : 'text-gray-600'}`}>
              {entry.map}
            </span>
            {entry.record ? (
              <div className="text-right">
                <span className="font-mono font-bold text-orange-400">
                  R{entry.record.round}
                </span>
                <p className="text-gray-600 text-xs">
                  {new Date(entry.record.played_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            ) : (
              <span className="text-gray-700 font-mono">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar src/App.tsx para usar Leaderboard**

Añadir el import:

```tsx
import { Leaderboard } from './components/Leaderboard'
```

Reemplazar el bloque `{view === 'leaderboard' && ...}` con:

```tsx
        {view === 'leaderboard' && (
          <>
            <GameSelector selected={selectedGame} onChange={setSelectedGame} />
            <Leaderboard game={selectedGame} sessions={sessions} />
          </>
        )}
```

- [ ] **Step 3: Probar en el navegador**

- Navegar a "Ranking" → ver la lista de mapas ordenada por ronda descendente.
- Los mapas sin récord deben aparecer al final con "—".
- El primer lugar en amarillo, segundo en gris, tercero en naranja oscuro.
- Cambiar entre BO1 y BO2 → el ranking debe actualizarse.

- [ ] **Step 4: Commit**

```bash
git add src/components/Leaderboard.tsx src/App.tsx
git commit -m "feat: leaderboard de mapas por ronda"
```

---

## Task 11: Stats

**Files:**
- Create: `src/components/Stats.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consume: `getFavoriteMap`, `getBestGlobalRecord`, `getTotalSessions` de `../utils/stats`
- Consume: `Game`, `Session` de `../types`
- Produce: `Stats({ game: Game, sessions: Session[] })`

- [ ] **Step 1: Crear src/components/Stats.tsx**

```tsx
import { getFavoriteMap, getBestGlobalRecord, getTotalSessions } from '../utils/stats'
import type { Game, Session } from '../types'

interface StatsProps {
  game: Game
  sessions: Session[]
}

export function Stats({ game, sessions }: StatsProps) {
  const favoriteMap = getFavoriteMap(sessions, game)
  const bestRecord = getBestGlobalRecord(sessions, game)
  const total = getTotalSessions(sessions, game)

  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold mb-4">Estadísticas</h2>

      <div className="flex flex-col gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Mejor récord global
          </p>
          {bestRecord ? (
            <>
              <p className="text-orange-400 font-mono text-4xl font-bold">
                R{bestRecord.round}
              </p>
              <p className="text-gray-500 text-sm mt-1">{bestRecord.map}</p>
            </>
          ) : (
            <p className="text-gray-600">Sin partidas aún</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Mapa favorito
          </p>
          <p className="text-white text-lg font-semibold">
            {favoriteMap ?? <span className="text-gray-600">—</span>}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {favoriteMap ? 'Mapa con más partidas' : 'Sin partidas aún'}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Total de partidas
          </p>
          <p className="text-white font-mono text-4xl font-bold">{total}</p>
          <p className="text-gray-600 text-xs mt-1">
            en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar src/App.tsx para usar Stats**

Añadir el import:

```tsx
import { Stats } from './components/Stats'
```

Reemplazar el bloque `{view === 'stats' && ...}` con:

```tsx
        {view === 'stats' && (
          <>
            <GameSelector selected={selectedGame} onChange={setSelectedGame} />
            <Stats game={selectedGame} sessions={sessions} />
          </>
        )}
```

- [ ] **Step 3: Probar en el navegador**

- Navegar a "Stats" → ver las tres tarjetas de estadísticas.
- Si hay partidas registradas: ver el récord global, el mapa favorito y el total.
- Si no hay partidas: ver los estados vacíos.
- Cambiar entre BO1 y BO2 → las stats deben actualizarse.

- [ ] **Step 4: Ejecutar los tests para confirmar que todo sigue verde**

```bash
npx vitest run
```

Esperado: todos los tests PASS.

- [ ] **Step 5: Commit final**

```bash
git add src/components/Stats.tsx src/App.tsx
git commit -m "feat: estadísticas globales — app completa"
```

---

## Verificación final

Después de completar todos los tasks, verificar el flujo completo:

1. Abrir la app en modo incógnito → pedir contraseña.
2. Entrar con contraseña correcta → ver el grid de BO1.
3. Añadir 3 partidas en mapas distintos de BO1.
4. Confirmar que las tarjetas muestran los récords.
5. Clicar en un mapa → ver el historial.
6. Añadir una partida superior al récord actual → ver "¡Nuevo récord!".
7. Navegar a Ranking → ver los mapas ordenados de mayor a menor ronda.
8. Navegar a Stats → ver el récord global, mapa favorito y total de partidas.
9. Cambiar a BO2 y repetir pasos 3-8.
10. Abrir la app en otro dispositivo/navegador → los datos deben ser los mismos (vienen de Supabase).
