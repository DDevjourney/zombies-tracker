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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
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
