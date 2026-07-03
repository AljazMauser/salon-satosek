"""Pydantic sheme za validacijo API zahtevkov in odgovorov."""

from datetime import date, datetime, time
from pydantic import BaseModel, Field
from typing import Optional


# --- Storitve ---

class StoritevOut(BaseModel):
    id: int
    ime: str
    cena: float
    trajanje_minut: int

    class Config:
        from_attributes = True


# --- Prosti termini ---

class TerminOut(BaseModel):
    datum: str  # YYYY-MM-DD
    ura: str    # HH:MM


class ProstiTerminiOut(BaseModel):
    datum: str
    prosti_termini: list[str]  # seznam ur, npr. ["08:00", "08:30", ...]


# --- Naročila ---

class NarociloCreate(BaseModel):
    stranka_ime: str = Field(..., min_length=1, max_length=100)
    stranka_priimek: str = Field(..., min_length=1, max_length=100)
    stranka_tel: str = Field(..., min_length=1, max_length=20)
    stranka_email: str = Field(..., max_length=150)
    storitev_id: int
    datum: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Datum v formatu YYYY-MM-DD")
    ura: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Ura v formatu HH:MM")
    opomba: Optional[str] = Field(None, max_length=500)


class NarociloOut(BaseModel):
    id: int
    stranka_ime: str
    stranka_priimek: str
    stranka_tel: str
    stranka_email: str
    storitev_id: int
    storitev_ime: Optional[str] = None
    storitev_cena: Optional[float] = None
    storitev_trajanje: Optional[int] = None
    datum_ura: datetime
    opomba: Optional[str] = None
    status: str
    ustvarjeno: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str  # "potrjeno", "zakljuceno", "preklicano"


# --- Admin prijava ---

class AdminLogin(BaseModel):
    geslo: str


class AdminToken(BaseModel):
    token: str


# --- Delovni čas ---

class DelovniCasOut(BaseModel):
    datum: date
    od: Optional[str] = None   # "HH:MM" ali None
    do: Optional[str] = None   # "HH:MM" ali None
    prost_dan: str             # "D" ali "N"

    class Config:
        from_attributes = True


class DelovniCasUpdate(BaseModel):
    od: Optional[str] = None   # "HH:MM", ali None če prost dan
    do: Optional[str] = None   # "HH:MM", ali None če prost dan
    prost_dan: str = "N"       # "D" = prost dan, "N" = delovni dan
