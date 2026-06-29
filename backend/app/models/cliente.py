from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Cliente(Base):

    __tablename__ = "Cliente"

    id_cliente = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombres = Column(
        String(100),
        nullable=False
    )

    apellidos = Column(
        String(100),
        nullable=False
    )

    documento_identidad = Column(
        String(30),
        nullable=False,
        unique=True
    )

    telefono = Column(
        String(20)
    )

    correo = Column(
        String(100)
    )

    ingresos_mensuales = Column(
        Float,
        nullable=False
    )

    fecha_registro = Column(
        DateTime,
        server_default=func.now()
    )