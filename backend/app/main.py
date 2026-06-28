from fastapi import FastAPI
from fastapi.params import Depends
from app.schemas.evaluation_request import EvaluationRequest
from app.rules.rule_engine import RuleEngine
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.decision_negocio import DecisionNegocio
from app.models.evento_auditoria import EventoAuditoria

app = FastAPI()

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