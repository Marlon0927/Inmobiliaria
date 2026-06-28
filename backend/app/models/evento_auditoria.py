from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class EventoAuditoria(Base):
    __tablename__ = "EventoAuditoria"

    id_evento = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_proceso = Column(
        Integer,
        ForeignKey("ProcesoInmobiliario.id_proceso"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        nullable=True
    )

    accion = Column(
        String(100),
        nullable=False
    )

    detalle = Column(
        String
    )

    fecha_evento = Column(
        DateTime,
        server_default=func.now()
    )