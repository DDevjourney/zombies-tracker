# Zombies Tracker — Design Spec

**Date:** 2026-09-09  
**Project:** Web privada de récords de Zombies (Black Ops 1 & 2)  
**Users:** Carlos + Moi (siempre juegan juntos)

---

## Objetivo

Web privada para registrar la ronda más alta alcanzada en cada mapa de zombies de Black Ops 1 y Black Ops 2. Como siempre juegan juntos, el récord es compartido (no se distingue por jugador). Cualquiera de los dos puede registrar una partida.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Contraseña compartida hardcodeada en variable de entorno

---

## Autenticación

- Variable de entorno `VITE_APP_PASSWORD` contiene la contraseña compartida.
- Al entrar, el usuario escribe la contraseña. Si coincide → se guarda en `sessionStorage` y se muestra la app.
- Sin cuentas de usuario, sin Supabase Auth. Comparación de strings en el cliente.

---

## Modelo de datos

### Tabla `sessions` (Supabase)

```sql
create table sessions (
  id         uuid        primary key default gen_random_uuid(),
  game       text        not null check (game in ('bo1', 'bo2')),
  map        text        not null,
  round      integer     not null check (round > 0),
  played_at  date        not null,
  created_at timestamptz not null default now()
);
```

- El récord de cada mapa se calcula en el cliente: `MAX(round)` del historial de ese mapa.
- Los mapas son datos estáticos en el frontend — no necesitan tabla propia.

---

## Mapas

### Black Ops 1
- Nacht der Untoten
- Verrückt
- Shi No Numa
- Der Riese
- Kino der Toten
- Five
- Ascension
- Call of the Dead
- Shangri-La
- Moon

### Black Ops 2
- TranZit
- Pueblo
- Granja
- Bus Depot
- Die Rise
- Mob of the Dead
- Buried
- Origins
- Nuketown Zombies
- Mob of the Dead (Pena)
- Pueblo (Pena)
- Granja (Pena)
- TranZit (Pena)

> Los mapas "Pena" son el modo Grief de BO2 (4v4 supervivencia).

---

## Vistas y navegación

### 1. Pantalla de login
- Campo de contraseña + botón entrar.
- Si la contraseña es incorrecta → mensaje de error.

### 2. Home (vista principal)
- Selector BO1 / BO2 en la parte superior (con carátulas de los juegos, fase visual).
- Grid de tarjetas de mapa. Cada tarjeta muestra:
  - Imagen del mapa (fase visual).
  - Nombre del mapa.
  - Récord actual: ronda + fecha.
  - Si no hay partida: "Sin récord aún".
- Botón flotante "+" para añadir una partida.

### 3. Modal "Añadir partida"
- Selector de mapa (dropdown, filtrado por juego activo).
- Campo de ronda (número entero > 0).
- Selector de fecha.
- Al guardar: si la ronda supera el récord actual → banner/badge automático "¡Nuevo récord!".

### 4. Vista de mapa (al clicar una tarjeta)
- Récord actual destacado en la parte superior.
- Historial completo de partidas ordenado por fecha descendente.
- Indicador visual en la partida que es el récord actual.

### 5. Leaderboard
- Lista de todos los mapas del juego seleccionado ordenados por récord de mayor a menor.
- Intercambiable entre BO1 y BO2.
- Mapas sin récord aparecen al final.

### 6. Estadísticas
- Mapa favorito (el que tiene más partidas registradas).
- Mejor récord global (ronda más alta de todos los mapas).
- Total de partidas registradas.

---

## Estructura de carpetas

```
src/
├── components/
│   ├── PasswordGate.tsx       # Pantalla de login
│   ├── GameSelector.tsx       # Tabs BO1 / BO2
│   ├── MapGrid.tsx            # Grid de tarjetas de mapa
│   ├── MapCard.tsx            # Tarjeta individual de mapa
│   ├── AddSessionModal.tsx    # Modal para añadir partida
│   ├── MapDetail.tsx          # Vista de mapa con historial
│   ├── Leaderboard.tsx        # Ranking de mapas por ronda
│   └── Stats.tsx              # Estadísticas globales
├── data/
│   └── maps.ts                # Datos estáticos de mapas por juego
├── hooks/
│   └── useSessions.ts         # Lógica para leer/escribir sesiones en Supabase
├── lib/
│   └── supabase.ts            # Cliente de Supabase
├── types/
│   └── index.ts               # Tipos TypeScript (Session, Game, Map...)
└── App.tsx
```

La lógica de negocio (calcular récord, detectar nuevo récord, calcular estadísticas) vive en `useSessions.ts` como custom hook. Es donde se aprende más JavaScript.

---

## Estética visual (fase posterior)

- Estilo oscuro, inspirado en los menús de Zombies de Black Ops 2.
- Acento en en negro y naranja.
- Tipografía monospace para los números de ronda.
- Tarjetas con imagen del mapa.
- Badge con el icono de zombies online de las escopetas para nuevo récord. (se proporcionará más adelante)
- Leaderboard estilo tabla de puntuaciones arcade.

> El diseño visual se abordará en una fase separada, una vez las funcionalidades estén completas.

---

## Decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| Persistencia | Supabase | Datos compartidos entre los dos usuarios desde cualquier dispositivo |
| Auth | Contraseña en .env | Suficiente para dos personas, sin complejidad de cuentas |
| Jugadores | Sin distinción | Siempre juegan juntos, el récord es compartido |
| Lógica de negocio | En el cliente | Máximo aprendizaje de JavaScript |
| Mapas de Grief | Incluidos con sufijo "(Pena)" | Forma coloquial que usan los usuarios |
