import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Toast({ mensaje, tipo, onClose }) {
  if (!mensaje) return null

  const Icon = tipo === 'error' ? AlertTriangle : CheckCircle2

  return (
    <div className={`toast toast-${tipo}`} onClick={onClose}>
      <Icon size={16} strokeWidth={2.25} />
      <span>{mensaje}</span>
    </div>
  )
}
