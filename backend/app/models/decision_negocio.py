from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class DecisionNegocio(Base):
    __tablename__ = "DecisionNegocio"

    id_decision = Column(Integer, primary_key=True, index=True)

    id_proceso = Column(
        Integer,
        ForeignKey("ProcesoInmobiliario.id_proceso"),
        nullable=False
    )

    resultado = Column(
        String(20),
        nullable=False
    )

    justificacion = Column(
        String
    )

    fecha_decision = Column(
        DateTime,
        server_default=func.now()
    )