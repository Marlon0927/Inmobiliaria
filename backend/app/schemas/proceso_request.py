from pydantic import BaseModel


class ProcesoRequest(BaseModel):
    id_solicitud: int
    documentos_completos: bool
    observaciones_contrato: bool
    firma_completada: bool
    acta_entrega: bool
    valor_canon: float