from pydantic import BaseModel

class EvaluationRequest(BaseModel):
    proceso_id: str
    tipo_operacion: str
    ingresos_cliente: float
    valor_canon: float
    documentos_completos: bool
    observaciones_contrato: bool
    firma_completada: bool
    acta_entrega: bool