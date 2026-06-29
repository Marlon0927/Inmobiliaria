import { useCallback, useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import AuthOverlay from './components/AuthOverlay'
import ClientesPage from './pages/ClientesPage'
import SolicitudesPage from './pages/SolicitudesPage'
import ProcesosPage from './pages/ProcesosPage'
import EvaluacionPage from './pages/EvaluacionPage'

const PAGES = {
  clientes: ClientesPage,
  solicitudes: SolicitudesPage,
  procesos: ProcesosPage,
  evaluacion: EvaluacionPage,
}

export default function App() {
  const [seccion, setSeccion] = useState('evaluacion')
  const [seccionPendiente, setSeccionPendiente] = useState(null)
  const [autenticando, setAutenticando] = useState(false)
  const [toast, setToast] = useState({ mensaje: '', tipo: 'success' })
  const [prefills, setPrefills] = useState({})
  const pendingPrefill = useRef(null)

  const mostrarToast = useCallback((mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast({ mensaje: '', tipo: 'success' }), 4000)
  }, [])

  const cerrarToast = () => setToast({ mensaje: '', tipo: 'success' })

  // Navegación desde sidebar (con auth simulada)
  const handleChangeSeccion = (key) => {
    if (key === seccion || autenticando) return
    setSeccionPendiente(key)
    setAutenticando(true)
  }

  // Navegación encadenada (sin auth redundante, con prefill)
  const handleIrA = useCallback((key, datos = {}) => {
    pendingPrefill.current = { key, datos }
    setSeccionPendiente(key)
    setAutenticando(true)
  }, [])

  const handleAuthFinish = useCallback(() => {
    const p = pendingPrefill.current
    if (p) {
      setPrefills((prev) => ({ ...prev, [p.key]: p.datos }))
      pendingPrefill.current = null
    }
    setSeccion(seccionPendiente)
    setSeccionPendiente(null)
    setAutenticando(false)
  }, [seccionPendiente])

  const Pagina = PAGES[seccion]

  return (
    <div className="app-layout">
      <div className="bg-dots" aria-hidden="true" />
      <Sidebar activa={seccion} onChange={handleChangeSeccion} />
      <main className="app-content">
        <Pagina
          onToast={mostrarToast}
          onIrA={handleIrA}
          prefill={prefills[seccion] || null}
        />
      </main>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={cerrarToast} />
      <AuthOverlay
        key={seccionPendiente}
        activo={autenticando}
        onFinish={handleAuthFinish}
      />
    </div>
  )
}
