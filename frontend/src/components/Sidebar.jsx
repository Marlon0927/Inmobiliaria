import { Users, ClipboardList, Building2, Scale } from 'lucide-react'

const SECCIONES = [
  { key: 'clientes', label: 'Clientes', Icon: Users },
  { key: 'solicitudes', label: 'Solicitudes', Icon: ClipboardList },
  { key: 'procesos', label: 'Procesos', Icon: Building2 },
  { key: 'evaluacion', label: 'Evaluación', Icon: Scale },
]

export default function Sidebar({ activa, onChange }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <img src="/brand-mark.svg" alt="" className="sidebar-brand-mark" width="32" height="32" />
        <div>
          <div className="sidebar-brand-title">SII</div>
          <div className="sidebar-brand-sub">Panel interno</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {SECCIONES.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`sidebar-item ${activa === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
          >
            <Icon size={17} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
