import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

const DURACION_MS = 1000
const INTERVALO_MS = 20

export default function AuthOverlay({ activo, onFinish }) {
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    if (!activo) return
    const pasos = DURACION_MS / INTERVALO_MS
    let actual = 0
    setProgreso(0)
    const interval = setInterval(() => {
      actual += 1
      setProgreso(Math.min(100, Math.round((actual / pasos) * 100)))
    }, INTERVALO_MS)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      onFinish()
    }, DURACION_MS)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [activo, onFinish])

  if (!activo) return null

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-icon">
          <ShieldCheck size={28} strokeWidth={2} />
        </div>
        <p className="auth-title">Autenticando usuario</p>
        <p className="auth-sub">Verificando permisos · Simulación RF-3</p>
        <div className="auth-bar-track">
          <div className="auth-bar-fill" style={{ width: `${progreso}%` }} />
        </div>
      </div>
    </div>
  )
}
