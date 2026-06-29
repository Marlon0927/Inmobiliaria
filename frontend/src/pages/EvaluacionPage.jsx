import { useState, useEffect, useMemo } from 'react'
import { Scale, CheckCircle2, XCircle, AlertTriangle, Search, Loader } from 'lucide-react'
import { evaluarProceso } from '../api/evaluacion'
import { obtenerProceso } from '../api/procesos'
import FlowBanner from '../components/FlowBanner'

const TIPO_LABEL = { 1: 'Arriendo', 2: 'Venta' }

const CHECK_CONFIG = [
  { key: 'documentos_completos',   label: 'Documentos completos',      warn: false },
  { key: 'observaciones_contrato', label: 'Observaciones en contrato', warn: true  },
  { key: 'firma_completada',       label: 'Firma completada',          warn: false },
  { key: 'acta_entrega',           label: 'Acta de entrega',           warn: false },
]

function calcularPuntaje(ingresos, canon) {
  const i = parseFloat(ingresos)
  const c = parseFloat(canon)
  if (!i || !c || c <= 0) return null
  const ratio = i / c
  let puntaje
  if (ratio < 1)      puntaje = Math.round(ratio * 20)
  else if (ratio < 2) puntaje = Math.round(20 + (ratio - 1) * 40)
  else if (ratio < 3) puntaje = Math.round(60 + (ratio - 2) * 25)
  else                puntaje = Math.min(99, Math.round(85 + (ratio - 3) * 4))
  return { puntaje, ratio: ratio.toFixed(2), cumple: ratio >= 2 }
}

function PuntajeBar({ ingresos, canon }) {
  const res = useMemo(() => calcularPuntaje(ingresos, canon), [ingresos, canon])
  if (!res) return null
  const color = res.cumple
    ? res.puntaje >= 85 ? '#1d9e75' : '#3db88a'
    : res.puntaje >= 40 ? '#f5a623' : '#e23b3b'
  return (
    <div className="puntaje-wrap">
      <div className="puntaje-header">
        <span className="puntaje-label">Probabilidad de aprobación financiera</span>
        <span className="puntaje-valor" style={{ color }}>{res.puntaje}%</span>
      </div>
      <div className="puntaje-track">
        <div className="puntaje-fill" style={{ width: `${res.puntaje}%`, background: color, transition: 'width 0.5s ease' }} />
        <div className="puntaje-umbral" title="Mínimo requerido (ratio 2×)" />
      </div>
      <div className="puntaje-detalle">
        <span>
          Ratio ingresos/canon: <strong>{res.ratio}×</strong>
          {res.cumple
            
          }
        </span>
      </div>
    </div>
  )
}

function CheckReadonly({ label, valor, warn }) {
  const checked = !!valor
  return (
    <div className={`check-item ${warn ? 'warn' : ''} ${checked ? 'checked' : ''}`} style={{ cursor: 'default' }}>
      <div className="check-icon" style={{ pointerEvents: 'none' }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="check-text">{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: checked ? 'inherit' : 'var(--text-faint)', opacity: 0.8 }}>
        {checked ? 'Sí' : 'No'}
      </span>
    </div>
  )
}

export default function EvaluacionPage({ onToast, prefill }) {
  const [procesoId, setProcesoId] = useState(prefill?.id_proceso ?? '')
  const [buscando, setBuscando] = useState(false)
  const [proceso, setProceso] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [evaluando, setEvaluando] = useState(false)

  useEffect(() => {
    if (prefill?.id_proceso) {
      setProcesoId(prefill.id_proceso)
      buscarProceso(prefill.id_proceso)
    }
  }, [prefill])

  const buscarProceso = async (id) => {
    const idNum = parseInt(id, 10)
    if (!idNum || idNum <= 0) {
      onToast('Ingresa un ID de proceso válido.', 'error')
      return
    }
    setBuscando(true)
    setProceso(null)
    setResultado(null)
    try {
      const data = await obtenerProceso(idNum)
      setProceso(data)
    } catch (err) {
      if (err.message === 'network') {
        onToast('No se pudo conectar con el servidor.', 'error')
      } else if (err.response?.status === 404) {
        onToast(`No existe un proceso con ID ${idNum}.`, 'error')
      } else {
        onToast('Error al consultar el proceso.', 'error')
      }
    } finally {
      setBuscando(false)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    buscarProceso(procesoId)
  }

  const handleEvaluar = async () => {
    if (!proceso) return
    setEvaluando(true)
    setResultado(null)
    try {
      const data = await evaluarProceso({
        proceso_id: String(proceso.id_proceso),
        tipo_operacion: proceso.tipo_operacion === 1 ? 'arriendo' : 'venta',
        ingresos_cliente: proceso.ingresos_cliente ?? 0,
        valor_canon: proceso.valor_canon,
        documentos_completos: proceso.documentos_completos,
        observaciones_contrato: proceso.observaciones_contrato,
        firma_completada: proceso.firma_completada,
        acta_entrega: proceso.acta_entrega,
      })
      setResultado(data)
    } catch (err) {
      if (err.message === 'network') {
        onToast('No se pudo conectar con el servidor.', 'error')
      } else {
        onToast('Error al evaluar el proceso.', 'error')
      }
    } finally {
      setEvaluando(false)
    }
  }

  const aprobado = resultado?.resultado === 'APROBADO'

  return (
    <div className="wrap">
      <FlowBanner seccionActual="evaluacion" />
      <div className="header">
        <h1>Evaluación</h1>
        <p>Motor de reglas · Ingresa el ID del proceso para consultar y evaluar</p>
      </div>

      {/* ── Buscador ── */}
      <form className="card" onSubmit={handleBuscar}>
        <div className="section-label">Proceso a evaluar</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>ID del proceso</label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 12"
              value={procesoId}
              onChange={(e) => { setProcesoId(e.target.value); setProceso(null); setResultado(null) }}
              required
              className={prefill?.id_proceso ? 'input-prefilled' : ''}
            />
            {prefill?.id_proceso && <span className="input-hint-ok">✓ Traído del proceso creado</span>}
          </div>
          <button className="btn-primary" type="submit" disabled={buscando} style={{ height: '36px', whiteSpace: 'nowrap' }}>
            {buscando
              ? <><Loader size={14} className="spin" /> Consultando...</>
              : <><Search size={14} /> Consultar proceso</>
            }
          </button>
        </div>
      </form>

      {/* ── Datos traídos del proceso ── */}
      {proceso && (
        <>
          <div className="card">
            <div className="section-label">Datos del proceso #{proceso.id_proceso}</div>
            <div className="eval-resumen-grid">
              <div className="eval-resumen-item">
                <span className="eval-resumen-label">Tipo de operación</span>
                <span className="eval-resumen-val">{TIPO_LABEL[proceso.tipo_operacion] ?? '—'}</span>
              </div>
              <div className="eval-resumen-item">
                <span className="eval-resumen-label">Valor del canon</span>
                <span className="eval-resumen-val">${parseFloat(proceso.valor_canon).toLocaleString('es-CO')}</span>
              </div>
              <div className="eval-resumen-item">
                <span className="eval-resumen-label">Ingresos del cliente</span>
                <span className="eval-resumen-val">
                  {proceso.ingresos_cliente
                    ? `$${parseFloat(proceso.ingresos_cliente).toLocaleString('es-CO')}`
                    : <span style={{ color: 'var(--warn)' }}>No disponible</span>
                  }
                </span>
              </div>
              <div className="eval-resumen-item">
                <span className="eval-resumen-label">Estado actual</span>
                <span className={`badge ${proceso.estado_proceso === 'APROBADO' ? 'badge-success' : proceso.estado_proceso === 'RECHAZADO' ? 'badge-danger' : 'badge-neutral'}`}>
                  {proceso.estado_proceso}
                </span>
              </div>
            </div>
            <PuntajeBar ingresos={proceso.ingresos_cliente} canon={proceso.valor_canon} />
            <p className="hint-text" style={{ marginTop: '0.75rem' }}>
              El cliente debe tener ingresos ≥ 2× el valor del canon.
            </p>
          </div>

          <div className="card">
            <div className="section-label">Verificación del proceso</div>
            <div className="checks-list">
              {CHECK_CONFIG.map(({ key, label, warn }) => (
                <CheckReadonly key={key} label={label} valor={proceso[key]} warn={warn} />
              ))}
            </div>
          </div>

          {/* ── Bloque final: decisión previa o botón de evaluar ── */}
          {proceso.ya_evaluado ? (
            <div className={`resultado ${proceso.decision_previa === 'APROBADO' ? 'aprobado' : 'rechazado'}`}>
              <h2>
                {proceso.decision_previa === 'APROBADO'
                  ? <CheckCircle2 size={18} />
                  : <XCircle size={18} />
                }
                <span className={`badge ${proceso.decision_previa === 'APROBADO' ? 'badge-success' : 'badge-danger'}`}>
                  {proceso.decision_previa} · Decisión ya registrada
                </span>
              </h2>
              <p style={{ fontSize: '0.82rem', marginTop: '10px', opacity: 0.85 }}>
                {proceso.justificacion_previa || 'Este proceso ya fue evaluado y no puede volver a procesarse.'}
              </p>
            </div>
          ) : (
            <>
              <button
                className="btn-primary"
                onClick={handleEvaluar}
                disabled={evaluando}
                style={{ width: '100%', padding: '12px' }}
              >
                {evaluando
                  ? <><Loader size={16} className="spin" /> Evaluando...</>
                  : <><Scale size={16} /> Ejecutar evaluación</>
                }
              </button>

              {resultado && !evaluando && (
                <div className={`resultado ${aprobado ? 'aprobado' : 'rechazado'}`}>
                  <h2>
                    {aprobado ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    <span className={`badge ${aprobado ? 'badge-success' : 'badge-danger'}`}>
                      {aprobado ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </h2>
                  {resultado.motivos.length > 0 ? (
                    <ul className="motivos">
                      {resultado.motivos.map((m, i) => (
                        <li key={i}><AlertTriangle size={14} />{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.83rem', color: 'var(--accent-dark)', marginTop: '10px' }}>
                      El proceso cumple con todos los requisitos.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}