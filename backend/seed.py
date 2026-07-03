"""Polni začetne podatke — storitve frizerskega salona."""

from database import engine, SessionLocal, Base
from models import Storitev


def seed_storitve():
    """Vstavi osnovne storitve, če tabela še nima podatkov."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Storitev).count() > 0:
            print("[INFO] Storitve ze obstajajo -- preskoceno.")
            return

        storitve = [
            Storitev(ime="Moško striženje", cena=15.0, trajanje_minut=30),
            Storitev(ime="Žensko striženje", cena=25.0, trajanje_minut=45),
            Storitev(ime="Otroško striženje", cena=10.0, trajanje_minut=30),
            Storitev(ime="Barvanje las", cena=35.0, trajanje_minut=90),
            Storitev(ime="Nega las", cena=20.0, trajanje_minut=45),
        ]

        db.add_all(storitve)
        db.commit()
        print("[OK] Zacetne storitve uspesno vstavljene.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_storitve()
