"""
FastAPI strežnik za Frizerski salon Satošek.
Zaganjanje: uvicorn main:app --reload --port 8000
"""

import hashlib
import secrets
from datetime import date, datetime, timedelta, time
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Narocilo, Storitev, StatusNarocila
from schemas import (
    AdminLogin,
    AdminToken,
    NarociloCreate,
    NarociloOut,
    ProstiTerminiOut,
    StatusUpdate,
    StoritevOut,
)
from seed import seed_storitve

# ---------------------------------------------------------------------------
# Konfiguracija
# ---------------------------------------------------------------------------

ADMIN_GESLO = "satosek2024"  # privzeto geslo — spremeni v produkciji

# Delovni čas salona
DELOVNI_CAS = {
    0: None,                    # Ponedeljek: 08:00–19:00
    1: None,                    # Torek
    2: None,                    # Sreda
    3: None,                    # Četrtek
    4: None,                    # Petek
    5: (time(8, 0), time(13, 0)),  # Sobota: 08:00–13:00
    6: None,                    # Nedelja: ZAPRTO
}

DELOVNI_CAS_DEFAULT = (time(8, 0), time(19, 0))  # Pon–Pet


def delovni_cas_za_dan(d: date) -> tuple[time, time] | None:
    """Vrne (od, do) za dan v tednu ali None, če je salon zaprt."""
    spec = DELOVNI_CAS.get(d.weekday(), DELOVNI_CAS_DEFAULT)
    if spec is None:
        return DELOVNI_CAS_DEFAULT if d.weekday() < 5 else None
    return spec


# ---------------------------------------------------------------------------
# FastAPI aplikacija
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Salon Satošek API",
    description="Backend za spletno stran in sistem naročanja Frizerskega salona Satošek",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — dovoli dostop iz React dev strežnika (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Zagon — ustvari tabele in seed
# ---------------------------------------------------------------------------

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_storitve()


# ---------------------------------------------------------------------------
# Pomožne funkcije
# ---------------------------------------------------------------------------

def generiraj_termine(d: date, trajanje_minut: int) -> list[str]:
    """
    Generira vse možne termine za dani datum glede na delovni čas.
    Termini so na vsakih 30 minut, zadnji možen začetek je
    (konec delovnika - trajanje storitve).
    """
    ure = delovni_cas_za_dan(d)
    if ure is None:
        return []  # zaprto

    od, do = ure
    termini = []

    current = datetime.combine(d, od)
    konec = datetime.combine(d, do)

    while current + timedelta(minutes=trajanje_minut) <= konec:
        termini.append(current.strftime("%H:%M"))
        current += timedelta(minutes=30)

    return termini


def prosti_termini_za_dan(db: Session, d: date, trajanje_minut: int) -> list[str]:
    """Vrne samo tiste termine, ki ne konfliktirajo z obstoječimi naročili."""
    vsi = generiraj_termine(d, trajanje_minut)

    if not vsi:
        return []

    # Pridobi vsa naročila za ta dan (razen preklicanih)
    zacetek_dneva = datetime.combine(d, time(0, 0))
    konec_dneva = datetime.combine(d, time(23, 59, 59))

    narocila = (
        db.query(Narocilo)
        .filter(
            Narocilo.datum_ura >= zacetek_dneva,
            Narocilo.datum_ura <= konec_dneva,
            Narocilo.status != StatusNarocila.PREKLICANO,
        )
        .all()
    )

    prosti = []
    for ura_str in vsi:
        h, m = map(int, ura_str.split(":"))
        zacetek = datetime.combine(d, time(h, m))
        konec = zacetek + timedelta(minutes=trajanje_minut)

        zaseden = False
        for n in narocila:
            n_konec = n.datum_ura + timedelta(minutes=n.storitev.trajanje_minut)
            # Konflikt: če se intervali prekrivajo
            if zacetek < n_konec and konec > n.datum_ura:
                zaseden = True
                break

        if not zaseden:
            prosti.append(ura_str)

    return prosti


def admin_token_ustvari() -> str:
    return secrets.token_hex(32)


def admin_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# Preprost slovar aktivnih admin sej (v produkciji uporabi Redis ali JWT)
admin_sessions: set[str] = set()


# ---------------------------------------------------------------------------
# API Končne točke
# ---------------------------------------------------------------------------

# --- Storitve ---

@app.get("/api/storitve", response_model=list[StoritevOut], tags=["Storitve"])
def vrni_storitve(db: Session = Depends(get_db)):
    """Vrne vse storitve salona."""
    return db.query(Storitev).order_by(Storitev.id).all()


# --- Prosti termini ---

@app.get("/api/prosti-termini", response_model=ProstiTerminiOut, tags=["Termini"])
def vrni_proste_termine(
    datum: str = Query(..., description="Datum v formatu YYYY-MM-DD"),
    storitev_id: int = Query(..., description="ID izbrane storitve"),
    db: Session = Depends(get_db),
):
    """
    Vrne proste termine za izbran datum in storitev.
    Upošteva delovni čas in že zasedene termine.
    """
    # Validacija datuma
    try:
        d = date.fromisoformat(datum)
    except ValueError:
        raise HTTPException(status_code=400, detail="Napačen format datuma. Uporabi YYYY-MM-DD.")

    # Preveri, da datum ni v preteklosti
    if d < date.today():
        raise HTTPException(status_code=400, detail="Datum je že pretekel.")

    # Preveri, da storitev obstaja
    storitev = db.query(Storitev).filter(Storitev.id == storitev_id).first()
    if not storitev:
        raise HTTPException(status_code=404, detail="Storitev ne obstaja.")

    # Preveri delovni čas
    if delovni_cas_za_dan(d) is None:
        return ProstiTerminiOut(datum=datum, prosti_termini=[])

    prosti = prosti_termini_za_dan(db, d, storitev.trajanje_minut)

    return ProstiTerminiOut(datum=datum, prosti_termini=prosti)


# --- Naročanje ---

@app.post("/api/naroci-se", response_model=NarociloOut, status_code=201, tags=["Naročila"])
def ustvari_narocilo(podatki: NarociloCreate, db: Session = Depends(get_db)):
    """Ustvari novo naročilo za frizersko storitev."""

    # Validacija storitve
    storitev = db.query(Storitev).filter(Storitev.id == podatki.storitev_id).first()
    if not storitev:
        raise HTTPException(status_code=404, detail="Storitev ne obstaja.")

    # Validacija datuma
    d = podatki.datum_ura.date()
    if d < date.today():
        raise HTTPException(status_code=400, detail="Datum ne more biti v preteklosti.")

    # Preveri delovni čas
    ure = delovni_cas_za_dan(d)
    if ure is None:
        raise HTTPException(status_code=400, detail="Salon je na izbrani dan zaprt.")

    od, do = ure
    ura_termina = podatki.datum_ura.time()
    konec_termina = (
        datetime.combine(d, ura_termina) + timedelta(minutes=storitev.trajanje_minut)
    ).time()

    if ura_termina < od or konec_termina > do:
        raise HTTPException(
            status_code=400,
            detail=f"Termin je izven delovnega časa ({od.strftime('%H:%M')}–{do.strftime('%H:%M')}).",
        )

    # Preveri, da termin ni že zaseden
    prosti = prosti_termini_za_dan(db, d, storitev.trajanje_minut)
    if ura_termina.strftime("%H:%M") not in prosti:
        raise HTTPException(status_code=409, detail="Termin je žal že zaseden.")

    # Ustvari naročilo
    narocilo = Narocilo(
        stranka_ime=podatki.stranka_ime,
        stranka_priimek=podatki.stranka_priimek,
        stranka_tel=podatki.stranka_tel,
        stranka_email=podatki.stranka_email,
        storitev_id=podatki.storitev_id,
        datum_ura=podatki.datum_ura,
        opomba=podatki.opomba,
        status=StatusNarocila.POTRJENO,
    )
    db.add(narocilo)
    db.commit()
    db.refresh(narocilo)

    return _obogati_narocilo(narocilo)


# --- Admin: Pregled naročil ---

@app.get("/api/narocila", response_model=list[NarociloOut], tags=["Admin"])
def vrni_narocila(
    od: str = Query(..., description="Začetni datum YYYY-MM-DD"),
    do: str = Query(..., description="Končni datum YYYY-MM-DD"),
    admin_token: str = Query(..., description="Admin avtorizacijski žeton"),
    db: Session = Depends(get_db),
):
    """Vrne vsa naročila v izbranem datumskem obdobju (samo za admina)."""
    if admin_token not in admin_sessions:
        raise HTTPException(status_code=401, detail="Neveljaven admin žeton.")

    od_date = date.fromisoformat(od)
    do_date = date.fromisoformat(do)

    narocila = (
        db.query(Narocilo)
        .filter(
            Narocilo.datum_ura >= datetime.combine(od_date, time(0, 0)),
            Narocilo.datum_ura <= datetime.combine(do_date, time(23, 59, 59)),
        )
        .order_by(Narocilo.datum_ura)
        .all()
    )

    return [_obogati_narocilo(n) for n in narocila]


# --- Admin: Posodobi status ---

@app.patch("/api/narocila/{narocilo_id}/status", response_model=NarociloOut, tags=["Admin"])
def posodobi_status(
    narocilo_id: int,
    podatki: StatusUpdate,
    admin_token: str = Query(..., description="Admin avtorizacijski žeton"),
    db: Session = Depends(get_db),
):
    """Posodobi status naročila (potrjeno / zaključeno / preklicano)."""
    if admin_token not in admin_sessions:
        raise HTTPException(status_code=401, detail="Neveljaven admin žeton.")

    if podatki.status not in ["potrjeno", "zakljuceno", "preklicano"]:
        raise HTTPException(status_code=400, detail="Neveljaven status.")

    narocilo = db.query(Narocilo).filter(Narocilo.id == narocilo_id).first()
    if not narocilo:
        raise HTTPException(status_code=404, detail="Naročilo ne obstaja.")

    narocilo.status = StatusNarocila(podatki.status)
    db.commit()
    db.refresh(narocilo)

    return _obogati_narocilo(narocilo)


# --- Admin: Prijava ---

@app.post("/api/admin/prijava", response_model=AdminToken, tags=["Admin"])
def admin_prijava(podatki: AdminLogin):
    """Prijava v admin panel. Vrne sejni žeton."""
    if podatki.geslo != ADMIN_GESLO:
        raise HTTPException(status_code=401, detail="Napačno geslo.")

    token = admin_token_ustvari()
    admin_sessions.add(token)
    return AdminToken(token=token)


@app.post("/api/admin/odjava", tags=["Admin"])
def admin_odjava(admin_token: str = Query(...)):
    """Odjava iz admin panela."""
    admin_sessions.discard(admin_token)
    return {"sporocilo": "Uspešno odjavljeni."}


# --- Pomožna funkcija ---

def _obogati_narocilo(narocilo: Narocilo) -> NarociloOut:
    """Doda podatke o storitvi v izhod naročila."""
    return NarociloOut(
        id=narocilo.id,
        stranka_ime=narocilo.stranka_ime,
        stranka_priimek=narocilo.stranka_priimek,
        stranka_tel=narocilo.stranka_tel,
        stranka_email=narocilo.stranka_email,
        storitev_id=narocilo.storitev_id,
        storitev_ime=narocilo.storitev.ime,
        storitev_cena=narocilo.storitev.cena,
        storitev_trajanje=narocilo.storitev.trajanje_minut,
        datum_ura=narocilo.datum_ura,
        opomba=narocilo.opomba,
        status=narocilo.status.value,
        ustvarjeno=narocilo.ustvarjeno,
    )
