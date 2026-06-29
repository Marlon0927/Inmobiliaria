from sqlalchemy import Column, Integer, Boolean, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class ProcesoInmobiliario(Base):

    __tablename__ = "ProcesoInmobiliario"

    id_proceso = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_solicitud = Column(
        Integer,
        ForeignKey("Solicitud.id_solicitud"),
        nullable=False
    )

    documentos_completos = Column(Boolean)

    observaciones_contrato = Column(Boolean)

    firma_completada = Column(Boolean)

    acta_entrega = Column(Boolean)

    valor_canon = Column(Float)

    estado_proceso = Column(
        String(50),
        default="EN_VALIDACION"
    )

    fecha_inicio = Column(
        DateTime,
        server_default=func.now()
    )

    fecha_fin = Column(
        DateTime,
        nullable=True
    )