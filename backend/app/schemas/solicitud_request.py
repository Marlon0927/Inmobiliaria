from pydantic import BaseModel


class SolicitudRequest(BaseModel):
    numero_radicado: str
    id_cliente: int
    id_asesor: int
    id_tipo_operacion: int