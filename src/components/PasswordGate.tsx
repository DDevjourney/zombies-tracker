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
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
        <h1
          className="font-display text-3xl font-bold text-center"
          style={{ color: 'var(--accent)', letterSpacing: '0.08em' }}
        >
          ZOMBIES TRACKER
        </h1>
        <input
          type="password"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Contraseña"
          className="px-4 py-2 rounded text-sm outline-none"
          style={{
            background: 'var(--surface-elevated)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          autoFocus
        />
        {error && (
          <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>
            Contraseña incorrecta
          </p>
        )}
        <button
          type="submit"
          className="font-display font-bold py-2 rounded text-sm"
          style={{ backgroundColor: 'var(--accent)', color: '#02020f', letterSpacing: '0.05em' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          ENTRAR
        </button>
      </form>
    </div>
  )
}
