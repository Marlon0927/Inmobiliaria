from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Solicitud(Base):

    __tablename__ = "Solicitud"

    id_solicitud = Column(
        Integer,
        primary_key=True,
        index=True
    )

    numero_radicado = Column(
        String(50),
        nullable=False
    )

    id_cliente = Column(
        Integer,
        ForeignKey("Cliente.id_cliente"),
        nullable=False
    )

    id_asesor = Column(
        Integer,
        nullable=False
    )

    id_tipo_operacion = Column(
        Integer,
        nullable=False
    )

    estado = Column(
        String(50),
        default="RADICADA"
    )

    fecha_solicitud = Column(
        DateTime,
        server_default=func.now()
    )