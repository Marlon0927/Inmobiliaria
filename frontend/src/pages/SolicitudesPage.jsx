import { useState, useEffect } from 'react'
import { FilePlus2, CheckCircle2 } from 'lucide-react'
import { crearSolicitud } from '../api/solicitudes'
import Loading from '../components/Loading'
import NextStepPrompt from '../components/NextStepPrompt'
import FlowBanner from '../components/FlowBanner'

const TIPOS_OPERACION = [
  { id: 1, label: 'Arriendo' },
  { id: 2, label: 'Venta' },
]

const initialForm = (prefill) => {
  const p = prefill ?? {}

  return {
    numero_radicado: '',
    id_cliente: p.id_cliente ?? '',
    id_asesor: '',
    id_tipo_operacion: TIPOS_OPERACION[0].id,
  }
}


export default function SolicitudesPage({ onToast, onIrA, prefill }) {
  const [form, setForm] = useState(initialForm(prefill))
  const [loading, setLoading] = useState(false)
  const [ultimaSolicitud, setUltimaSolicitud] = useState(null)
  const [mostrarContinuar, setMostrarContinuar] = useState(false)

  useEffect(() => {
    if (prefill?.id_cliente) {
      setForm((prev) => ({ ...prev, id_cliente: prefill.id_cliente }))
    }
  }, [prefill])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await crearSolicitud({
        ...form,
        id_cliente: parseInt(form.id_cliente, 10),
        id_asesor: parseInt(form.id_asesor, 10),
        id_tipo_operacion: parseInt(form.id_tipo_operacion, 10),
      })
      const solicitud = { ...form, id_solicitud: data.id_solicitud }
      setUltimaSolicitud(solicitud)
      onToast(`Solicitud creada · ID ${data.id_solicitud}`, 'success')
      setForm(initialForm())
      setMostrarContinuar(true)
    } catch (err) {
      if (err.message === 'network') {
        onToast('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 'error')
      } else {
        onToast('No se pudo crear la solicitud. Verifica que el ID de cliente exista.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wrap">
      <FlowBanner seccionActual="solicitudes" />
      <div className="header">
        <h1>Solicitudes</h1>
        <p>Radica una nueva solicitud asociada a un cliente</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="section-label">Datos de la solicitud</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Número de radicado</label>
            <input name="numero_radicado" value={form.numero_radicado} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>ID del cliente</label>
            <input
              name="id_cliente"
              type="number"
              min="1"
              value={form.id_cliente}
              onChange={handleChange}
              required
              className={prefill?.id_cliente ? 'input-prefilled' : ''}
            />
            {prefill?.id_cliente && (
              <span className="input-hint-ok">✓ Traído del cliente creado</span>
            )}
          </div>
          <div className="form-field">
            <label>ID del asesor</label>
            <input name="id_asesor" type="number" min="1" value={form.id_asesor} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Tipo de operación</label>
            <select name="id_tipo_operacion" value={form.id_tipo_operacion} onChange={handleChange}>
              {TIPOS_OPERACION.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.1rem' }}>
          <FilePlus2 size={16} />
          {loading ? 'Guardando...' : 'Crear solicitud'}
        </button>
      </form>

      {loading && <Loading texto="Radicando solicitud..." />}

      {ultimaSolicitud && !loading && (
        <div className="card info-card">
          <div className="section-label">
            <CheckCircle2 size={14} /> Última solicitud creada
          </div>
          <table className="summary-table">
            <tbody>
              <tr><td>ID Solicitud</td><td><strong>{ultimaSolicitud.id_solicitud}</strong></td></tr>
              <tr><td>Radicado</td><td>{ultimaSolicitud.numero_radicado}</td></tr>
              <tr><td>ID Cliente</td><td>{ultimaSolicitud.id_cliente}</td></tr>
            </tbody>
          </table>
          {mostrarContinuar && (
            <NextStepPrompt
              mensaje={`Solicitud #${ultimaSolicitud.id_solicitud} radicada.`}
              accion="¿Deseas crear el proceso ahora? El ID se llenará automáticamente."
              onAceptar={() => { setMostrarContinuar(false); onIrA('procesos', { id_solicitud: ultimaSolicitud.id_solicitud }) }}
              onIgnorar={() => setMostrarContinuar(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
