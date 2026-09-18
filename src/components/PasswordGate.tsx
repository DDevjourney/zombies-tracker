import { useEffect, useRef, useState, type FormEvent } from 'react'
import { animate, reducedMotion, shake } from '../lib/motion'

interface PasswordGateProps {
  onSuccess: () => void
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const leaving = useRef(false)

  useEffect(() => {
    if (!formRef.current) return
    if (!reducedMotion()) {
      animate(formRef.current, { opacity: [0, 1], scale: [0.94, 1], duration: 600, ease: 'outCubic' })
    }
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (leaving.current) return
    if (value === import.meta.env.VITE_APP_PASSWORD) {
      sessionStorage.setItem('auth', 'true')
      if (reducedMotion() || !formRef.current) {
        onSuccess()
        return
      }
      leaving.current = true
      animate(formRef.current, {
        scale: [1, 1.15],
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(6px)'],
        duration: 450,
        ease: 'inCubic',
        onComplete: onSuccess,
      })
    } else {
      setError(true)
      setValue('')
      if (formRef.current) shake(formRef.current)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form ref={formRef} onSubmit={handleSubmit} className="glass-elevated chamfer flex flex-col gap-4 w-80 p-8">
        <div className="text-center">
          <p className="hud-label justify-center mb-2">Acceso restringido</p>
          <h1
            className="font-display text-4xl font-bold"
            style={{ color: 'var(--accent)', letterSpacing: '0.1em', textShadow: '0 0 24px var(--accent-glow)' }}
          >
            Zombies Tracker
          </h1>
        </div>
        <input
          type="password"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Contraseña"
          className="field"
          style={error ? { borderColor: 'var(--danger)', borderLeftColor: 'var(--danger)' } : undefined}
          aria-invalid={error}
          aria-describedby={error ? 'pw-error' : undefined}
          autoFocus
        />
        {error && (
          <p id="pw-error" className="text-sm text-center" style={{ color: '#ff5a63' }}>
            Contraseña incorrecta
          </p>
        )}
        <button type="submit" className="btn btn-primary chamfer" style={{ borderRadius: 0 }}>
          Entrar
        </button>
      </form>
    </div>
  )
}
