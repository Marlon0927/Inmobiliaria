from pydantic import BaseModel


class ClientRequest(BaseModel):
    nombres: str
    apellidos: str
    documento_identidad: str
    telefono: str
    correo: str
    ingresos_mensuales: float