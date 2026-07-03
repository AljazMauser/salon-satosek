"""SQLAlchemy modeli za bazo podatkov."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from database import Base


class StatusNarocila(str, enum.Enum):
    POTRJENO = "potrjeno"
    ZAKLJUCENO = "zakljuceno"
    PREKLICANO = "preklicano"


class Storitev(Base):
    __tablename__ = "storitve"

    id = Column(Integer, primary_key=True, index=True)
    ime = Column(String(100), nullable=False)
    cena = Column(Float, nullable=False)  # cena v EUR
    trajanje_minut = Column(Integer, nullable=False)  # npr. 30, 45, 60

    narocila = relationship("Narocilo", back_populates="storitev")


class Narocilo(Base):
    __tablename__ = "narocila"

    id = Column(Integer, primary_key=True, index=True)
    stranka_ime = Column(String(100), nullable=False)
    stranka_priimek = Column(String(100), nullable=False)
    stranka_tel = Column(String(20), nullable=False)
    stranka_email = Column(String(150), nullable=False)
    storitev_id = Column(Integer, ForeignKey("storitve.id"), nullable=False)
    datum_ura = Column(DateTime, nullable=False)  # točen datum in ura termina
    opomba = Column(String(500), nullable=True)
    status = Column(Enum(StatusNarocila), default=StatusNarocila.POTRJENO, nullable=False)
    ustvarjeno = Column(DateTime, default=datetime.utcnow)

    storitev = relationship("Storitev", back_populates="narocila")
