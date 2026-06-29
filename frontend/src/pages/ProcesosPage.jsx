import { useState, useEffect } from 'react'
import { Building2, CheckCircle2, Check } from 'lucide-react'
import { crearProceso } from '../api/procesos'
import Loading from '../components/Loading'
import NextStepPrompt from '../components/NextStepPrompt'
import FlowBanner from '../components/FlowBanner'

const CHECKS = [
  { key: 'documentos_completos', label: 'Documentos completos', warn: false },
  { key: 'observaciones_contrato', label: 'Observaciones en contrato', warn: true },
  { key: 'firma_completada', label: 'Firma completada', warn: false },
  { key: 'acta_entrega', label: 'Acta de entrega', warn: false },
]

const initialChecks = {
  documentos_completos: false,
  observaciones_contrato: false,
  firma_completada: false,
  acta_entrega: false,
}

export default function ProcesosPage({ onToast, onIrA, prefill }) {
  const [idSolicitud, setIdSolicitud] = useState(prefill?.id_solicitud ?? '')
  const [valorCanon, setValorCanon] = useState('')
  const [checks, setChecks] = useState(initialChecks)
  const [loading, setLoading] = useState(false)
  const [ultimoProceso, setUltimoProceso] = useState(null)
  const [mostrarContinuar, setMostrarContinuar] = useState(false)

  useEffect(() => {
    if (prefill?.id_solicitud) setIdSolicitud(prefill.id_solicitud)
  }, [prefill])

  const toggleCheck = (key) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const canon = parseFloat(valorCanon)
    if (!canon || canon <= 0) {
      onToast('El valor del canon debe ser mayor a 0.', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await crearProceso({
        id_solicitud: parseInt(idSolicitud, 10),
        valor_canon: canon,
        ...checks,
      })
      const proceso = { id_proceso: data.id_proceso, id_solicitud: idSolicitud, valor_canon: canon }
      setUltimoProceso(proceso)
      onToast(`Proceso creado · ID ${data.id_proceso}`, 'success')
      setIdSolicitud('')
      setValorCanon('')
      setChecks(initialChecks)
      setMostrarContinuar(true)
    } catch (err) {
      if (err.message === 'network') {
        onToast('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 'error')
      } else {
        onToast('No se pudo crear el proceso. Verifica que el ID de solicitud exista.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wrap">
      <FlowBanner seccionActual="procesos" />
      <div className="header">
        <h1>Procesos</h1>
        <p>Crea el proceso inmobiliario asociado a una solicitud</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="section-label">Datos del proceso</div>
        <div className="form-grid">
          <div className="form-field">
            <label>ID de la solicitud</label>
            <input
              type="number"
              min="1"
              value={idSolicitud}
              onChange={(e) => setIdSolicitud(e.target.value)}
              required
              className={prefill?.id_solicitud ? 'input-prefilled' : ''}
            />
            {prefill?.id_solicitud && (
              <span className="input-hint-ok">✓ Traído de la solicitud creada</span>
            )}
          </div>
          <div className="form-field">
            <label>Valor del canon</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={valorCanon}
              onChange={(e) => setValorCanon(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="section-label" style={{ marginTop: '1.25rem' }}>Estado del proceso</div>
        <div className="checks-list">
          {CHECKS.map(({ key, label, warn }) => (
            <div
              key={key}
              className={`check-item ${warn ? 'warn' : ''} ${checks[key] ? 'checked' : ''}`}
              onClick={() => toggleCheck(key)}
            >
              <div className="check-icon"><Check size={12} strokeWidth={3} /></div>
              <span className="check-text">{label}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.1rem' }}>
          <Building2 size={16} />
          {loading ? 'Guardando...' : 'Crear proceso'}
        </button>
      </form>

      {loading && <Loading texto="Creando proceso..." />}

      {ultimoProceso && !loading && (
        <div className="card info-card">
          <div className="section-label">
            <CheckCircle2 size={14} /> Último proceso creado
          </div>
          <table className="summary-table">
            <tbody>
              <tr><td>ID Proceso</td><td><strong>{ultimoProceso.id_proceso}</strong></td></tr>
              <tr><td>ID Solicitud</td><td>{ultimoProceso.id_solicitud}</td></tr>
              <tr><td>Canon</td><td>${parseFloat(ultimoProceso.valor_canon).toLocaleString('es-CO')}</td></tr>
            </tbody>
          </table>
          {mostrarContinuar && (
            <NextStepPrompt
              mensaje={`Proceso #${ultimoProceso.id_proceso} creado.`}
              accion="¿Deseas evaluar este proceso ahora? El ID y el canon se llenarán automáticamente."
              onAceptar={() => {
                setMostrarContinuar(false)
                onIrA('evaluacion', { id_proceso: ultimoProceso.id_proceso, valor_canon: ultimoProceso.valor_canon })
              }}
              onIgnorar={() => setMostrarContinuar(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
