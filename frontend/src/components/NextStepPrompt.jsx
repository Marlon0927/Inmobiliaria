import { ArrowRight } from 'lucide-react'

export default function NextStepPrompt({ mensaje, accion, onAceptar, onIgnorar }) {
  return (
    <div className="next-step-prompt">
      <div className="next-step-text">
        <strong>{mensaje}</strong>
        <span>{accion}</span>
      </div>
      <div className="next-step-btns">
        <button className="next-step-skip" onClick={onIgnorar}>Ahora no</button>
        <button className="next-step-go" onClick={onAceptar}>
          Continuar <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
