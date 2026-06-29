from fastapi import FastAPI
from fastapi.params import Depends
from app.schemas.evaluation_request import EvaluationRequest
from app.rules.rule_engine import RuleEngine
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import get_db
from app.models.decision_negocio import DecisionNegocio
from app.models.evento_auditoria import EventoAuditoria
from app.models.cliente import Cliente
from app.schemas.cliente_request import ClientRequest
from app.models.solicitud import Solicitud
from app.schemas.solicitud_request import SolicitudRequest
from app.models.proceso_inmobiliario import ProcesoInmobiliario
from app.schemas.proceso_request import ProcesoRequest

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/evaluate")
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db)
):

    result = RuleEngine.evaluate(request)

    decision = DecisionNegocio(
        id_proceso=int(request.proceso_id),
        resultado=result["resultado"],
        justificacion="\n".join(result["motivos"])
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
def crear_cliente(
        request: ClientRequest,
        db: Session = Depends(get_db)
):

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
def crear_solicitud(
        request: SolicitudRequest,
        db: Session = Depends(get_db)
):

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
def crear_proceso(
        request: ProcesoRequest,
        db: Session = Depends(get_db)
):

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