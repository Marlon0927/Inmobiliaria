import { useState } from 'react'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import { crearCliente } from '../api/clientes'
import Loading from '../components/Loading'
import NextStepPrompt from '../components/NextStepPrompt'
import FlowBanner from '../components/FlowBanner'

const initialForm = {
  nombres: '',
  apellidos: '',
  documento_identidad: '',
  telefono: '',
  correo: '',
  ingresos_mensuales: '',
}

export default function ClientesPage({ onToast, onIrA }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [ultimoCliente, setUltimoCliente] = useState(null)
  const [mostrarContinuar, setMostrarContinuar] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ingresos = parseFloat(form.ingresos_mensuales)
    if (!ingresos || ingresos <= 0) {
      onToast('Los ingresos mensuales deben ser mayores a 0.', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await crearCliente({ ...form, ingresos_mensuales: ingresos })
      const cliente = { ...form, id_cliente: data.id_cliente }
      setUltimoCliente(cliente)
      onToast(`Cliente creado · ID ${data.id_cliente}`, 'success')
      setForm(initialForm)
      setMostrarContinuar(true)
    } catch (err) {
      if (err.message === 'network') {
        onToast('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 'error')
      } else {
        onToast('No se pudo crear el cliente. Verifica que el documento no esté duplicado.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wrap">
      <FlowBanner seccionActual="clientes" />
      <div className="header">
        <h1>Clientes</h1>
        <p>Registra al cliente para iniciar el flujo de solicitud</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="section-label">Datos personales</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Nombres</label>
            <input name="nombres" value={form.nombres} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Apellidos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Documento de identidad</label>
            <input name="documento_identidad" value={form.documento_identidad} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Correo</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Ingresos mensuales</label>
            <input
              name="ingresos_mensuales"
              type="number"
              min="1"
              step="0.01"
              value={form.ingresos_mensuales}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.1rem' }}>
          <UserPlus size={16} />
          {loading ? 'Guardando...' : 'Crear cliente'}
        </button>
      </form>

      {loading && <Loading texto="Guardando cliente..." />}

      {ultimoCliente && !loading && (
        <div className="card info-card">
          <div className="section-label">
            <CheckCircle2 size={14} /> Último cliente creado
          </div>
          <table className="summary-table">
            <tbody>
              <tr><td>ID Cliente</td><td><strong>{ultimoCliente.id_cliente}</strong></td></tr>
              <tr><td>Nombre</td><td>{ultimoCliente.nombres} {ultimoCliente.apellidos}</td></tr>
              <tr><td>Ingresos</td><td>${parseFloat(ultimoCliente.ingresos_mensuales).toLocaleString('es-CO')}</td></tr>
            </tbody>
          </table>
          {mostrarContinuar && (
            <NextStepPrompt
              mensaje={`Cliente #${ultimoCliente.id_cliente} listo.`}
              accion="¿Deseas crear la solicitud ahora? El ID se llenará automáticamente."
              onAceptar={() => { setMostrarContinuar(false); onIrA('solicitudes', { id_cliente: ultimoCliente.id_cliente }) }}
              onIgnorar={() => setMostrarContinuar(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
