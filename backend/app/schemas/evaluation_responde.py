from pydantic import BaseModel

class EvaluationResponse(BaseModel):
    proceso_id: str
    resultado: str
    motivos: list[str]