import { Users, ClipboardList, Building2, Scale, ChevronRight } from 'lucide-react'

const PASOS = [
  { key: 'clientes', label: 'Cliente', Icon: Users },
  { key: 'solicitudes', label: 'Solicitud', Icon: ClipboardList },
  { key: 'procesos', label: 'Proceso', Icon: Building2 },
  { key: 'evaluacion', label: 'Evaluación', Icon: Scale },
]

export default function FlowBanner({ seccionActual }) {
  const idxActual = PASOS.findIndex((p) => p.key === seccionActual)
  return (
    <div className="flow-banner">
      {PASOS.map(({ key, label, Icon }, i) => (
        <span key={key} className="flow-banner-step-wrap">
          <span className={`flow-banner-step ${i < idxActual ? 'done' : ''} ${i === idxActual ? 'active' : ''}`}>
            <Icon size={12} />
            {label}
          </span>
          {i < PASOS.length - 1 && <ChevronRight size={12} className="flow-banner-sep" />}
        </span>
      ))}
    </div>
  )
}
