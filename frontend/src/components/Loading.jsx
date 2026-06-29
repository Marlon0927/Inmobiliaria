import { Loader2 } from 'lucide-react'

export default function Loading({ texto = 'Procesando...' }) {
  return (
    <div className="loading-wrap">
      <span className="loading-icon">
        <Loader2 size={22} className="spin" />
      </span>
      <p className="loading-txt">{texto}</p>
    </div>
  )
}
