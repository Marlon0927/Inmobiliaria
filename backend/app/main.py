from fastapi import FastAPI, HTTPException
from fastapi.params import Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.schemas.evaluation_request import EvaluationRequest
from app.rules.rule_engine import RuleEngine
from app.database.session import get_db
from app.models.decision_negocio import DecisionNegocio
from app.models.evento_auditoria import EventoAuditoria
from app.models.cliente import Cliente
from app.models.solicitud import Solicitud
from app.models.proceso_inmobiliario import ProcesoInmobiliario
from app.schemas.cliente_request import ClientRequest
from app.schemas.solicitud_request import SolicitudRequest
from app.schemas.proceso_request import ProcesoRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/solicitud/{id_solicitud}")
def get_solicitud(id_solicitud: int, db: Session = Depends(get_db)):
    solicitud = db.query(Solicitud).filter(
        Solicitud.id_solicitud == id_solicitud
    ).first()

    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    proceso = db.query(ProcesoInmobiliario).filter(
        ProcesoInmobiliario.id_solicitud == id_solicitud
    ).first()

    cliente = db.query(Cliente).filter(
        Cliente.id_cliente == solicitud.id_cliente
    ).first()

    return {
        "id_solicitud": solicitud.id_solicitud,
        "id_proceso": proceso.id_proceso if proceso else None,
        "tipo_operacion": "arriendo" if solicitud.id_tipo_operacion == 1 else "venta",
        "ingresos_cliente": cliente.ingresos_mensuales if cliente else None,
        "valor_canon": proceso.valor_canon if proceso else None,
    }

@app.post("/evaluate")
def evaluate(request: EvaluationRequest, db: Session = Depends(get_db)):

    proceso = db.query(ProcesoInmobiliario).filter(
        ProcesoInmobiliario.id_proceso == int(request.proceso_id)
    ).first()

    if not proceso:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    result = RuleEngine.evaluate(request)

    proceso.estado_proceso = result["resultado"]
    db.commit()

    decision = DecisionNegocio(
        id_proceso=int(request.proceso_id),
        resultado=result["resultado"],
        justificacion="\n".join(result["motivos"]) if result["motivos"] else "Cumple todos los requisitos"
    )
    db.add(decision)
    db.commit()

    auditoria = EventoAuditoria(
        id_proceso=int(request.proceso_id),
        accion="Evaluación ejecutada",
        detalle=f"Resultado obtenido: {result['resultado']}"
    )
    db.add(auditoria)
    db.commit()

    return result

@app.post("/clientes")
def crear_cliente(request: ClientRequest, db: Session = Depends(get_db)):
    cliente = Cliente(
        nombres=request.nombres,
        apellidos=request.apellidos,
        documento_identidad=request.documento_identidad,
        telefono=request.telefono,
        correo=request.correo,
        ingresos_mensuales=request.ingresos_mensuales
    )
    db.add(cliente)
    db.commit()
    db.refresh(cliente)

    return {
        "mensaje": "Cliente creado correctamente",
        "id_cliente": cliente.id_cliente
    }

@app.post("/solicitudes")
def crear_solicitud(request: SolicitudRequest, db: Session = Depends(get_db)):
    solicitud = Solicitud(
        numero_radicado=request.numero_radicado,
        id_cliente=request.id_cliente,
        id_asesor=request.id_asesor,
        id_tipo_operacion=request.id_tipo_operacion,
        estado="RADICADA"
    )
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)

    return {
        "mensaje": "Solicitud creada correctamente",
        "id_solicitud": solicitud.id_solicitud
    }

@app.post("/procesos")
def crear_proceso(request: ProcesoRequest, db: Session = Depends(get_db)):
    proceso = ProcesoInmobiliario(
        id_solicitud=request.id_solicitud,
        documentos_completos=request.documentos_completos,
        observaciones_contrato=request.observaciones_contrato,
        firma_completada=request.firma_completada,
        acta_entrega=request.acta_entrega,
        valor_canon=request.valor_canon,
        estado_proceso="EN_VALIDACION"
    )
    db.add(proceso)
    db.commit()
    db.refresh(proceso)

    return {
        "mensaje": "Proceso creado correctamente",
        "id_proceso": proceso.id_proceso
    }

@app.get("/procesos/{id_proceso}")
def obtener_proceso(id_proceso: int, db: Session = Depends(get_db)):
    proceso = db.query(ProcesoInmobiliario).filter(
        ProcesoInmobiliario.id_proceso == id_proceso
    ).first()
    if not proceso:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    solicitud = db.query(Solicitud).filter(
        Solicitud.id_solicitud == proceso.id_solicitud
    ).first()

    cliente = None
    if solicitud:
        cliente = db.query(Cliente).filter(
            Cliente.id_cliente == solicitud.id_cliente
        ).first()

    # ← NUEVO: buscar si ya existe una decisión previa
    decision = db.query(DecisionNegocio).filter(
        DecisionNegocio.id_proceso == id_proceso
    ).first()

    return {
        "id_proceso":             proceso.id_proceso,
        "id_solicitud":           proceso.id_solicitud,
        "documentos_completos":   proceso.documentos_completos,
        "observaciones_contrato": proceso.observaciones_contrato,
        "firma_completada":       proceso.firma_completada,
        "acta_entrega":           proceso.acta_entrega,
        "valor_canon":            proceso.valor_canon,
        "estado_proceso":         proceso.estado_proceso,
        "tipo_operacion":         solicitud.id_tipo_operacion if solicitud else None,
        "ingresos_cliente":       cliente.ingresos_mensuales if cliente else None,
        # ← NUEVO
        "ya_evaluado":            decision is not None,
        "decision_previa":        decision.resultado if decision else None,
        "justificacion_previa":   decision.justificacion if decision else None,
    }