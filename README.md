# 💈 Salon Satošek — Spletna stran z naprednim sistemom naročanja

![Tehnologije](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

Sodobna, odzivna spletna stran za **Frizerski salon Satošek** (Igor Satošek s.p.) iz Črnomlja z vgrajenim naprednim sistemom za spletno naročanje v stilu **Lime Booking**.

---

## 📸 Zaslonske slike (prikaz funkcionalnosti)

| Funkcionalnost | Opis |
|---|---|
| 🏠 **Domača stran** | Eleganten hero odsek, storitve, kontakt, zemljevid |
| 📅 **Spletno naročanje** | 4-koračni stepper (storitev → termin → podatki → pregled) |
| 🔐 **Admin panel** | Tedenski koledar z možnostjo potrjevanja/zaključevanja naročil |

---

## 🛠 Tehnologije

### Frontend
- **[React 18](https://react.dev/)** — Uporabniški vmesnik
- **[Tailwind CSS 3](https://tailwindcss.com/)** — Eleganten, temno-zlat dizajn
- **[React Router 7](https://reactrouter.com/)** — Usmerjanje (`/` in `/admin`)
- **[Leaflet](https://leafletjs.com/)** + **[React-Leaflet](https://react-leaflet.js.org/)** — Interaktivni zemljevid
- **[Vite 5](https://vitejs.dev/)** — Hitra gradnja in razvoj

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — Python REST API
- **[SQLAlchemy](https://www.sqlalchemy.org/)** — ORM za delo z bazo
- **[SQLite](https://www.sqlite.org/)** — Podatkovna baza (brez dodatne namestitve)
- **[Pydantic](https://docs.pydantic.dev/)** — Validacija podatkov

---

## 📁 Struktura projekta

```
salon-satosek/
│
├── index.html                  # Vstopna HTML stran
├── package.json                # NPM odvisnosti (frontend)
├── vite.config.js              # Vite konfiguracija
├── tailwind.config.js          # Tailwind teme (zlati/dark toni)
├── postcss.config.js           # PostCSS konfiguracija
├── README.md                   # 📖 Ta dokumentacija
│
├── public/
│   └── scissors.svg            # Ikona strani
│
├── src/                        # Frontend React koda
│   ├── main.jsx                # Vstopna točka Reacta
│   ├── App.jsx                 # Glavna komponenta (routing)
│   ├── index.css               # Globalni CSS + Tailwind direktive
│   ├── api.js                  # API pomočnik (fetch wrapper)
│   │
│   ├── context/
│   │   └── BookingContext.jsx  # React kontekst za modal naročanja
│   │
│   └── components/
│       ├── Navbar.jsx          # Navigacijska vrstica
│       ├── Hero.jsx            # Hero sekcija z CTA
│       ├── Services.jsx        # Storitve s cenami
│       ├── Contact.jsx         # Kontaktni podatki in delovni čas
│       ├── Location.jsx        # Interaktivni zemljevid (Leaflet)
│       ├── Footer.jsx          # Noga strani
│       ├── BookingModal.jsx    # ⭐ Modal za spletno naročanje (4 koraki)
│       ├── AdminPage.jsx       # Admin router (prijava / dashboard)
│       ├── AdminLogin.jsx      # Admin prijavna stran
│       └── Admin.jsx           # Admin koledar naročil
│
└── backend/                    # FastAPI Python backend
    ├── requirements.txt        # Python odvisnosti
    ├── main.py                 # ⭐ FastAPI aplikacija + API končne točke
    ├── database.py             # Povezava na SQLite bazo
    ├── models.py               # SQLAlchemy modeli (Storitve, Narocila)
    ├── schemas.py              # Pydantic sheme za validacijo
    └── seed.py                 # Začetni podatki (storitve salona)
```

---

## 🚀 Kako zagnati projekt lokalno

### Predpogoji
- **Node.js** (v18 ali novejši)
- **Python** (v3.11 ali novejši)
- **npm** (priložen Node.js)

### 1. korak — Kloniranje repozitorija
```bash
git clone https://github.com/AljazMauser/salon-satosek.git
cd salon-satosek
```

### 2. korak — Zagon backend strežnika (FastAPI)
```bash
# Pomakni se v mapo backend
cd backend

# Namesti Python odvisnosti
pip install -r requirements.txt

# Zaženi FastAPI strežnik na portu 8000
python -m uvicorn main:app --reload --port 8000
```

Backend bo dostopen na:
- API: **http://localhost:8000/api/**
- Swagger dokumentacija: **http://localhost:8000/api/docs**

### 3. korak — Zagon frontend strežnika (React + Vite)
```bash
# Pomakni se nazaj v korensko mapo
cd ..

# Namesti NPM pakete
npm install

# Zaženi razvojni strežnik
npm run dev
```

Frontend bo dostopen na: **http://localhost:5173**

---

## 📡 API Končne točke

| Metoda | Pot | Opis |
|---|---|---|
| `GET` | `/api/storitve` | Vrne vse storitve salona |
| `GET` | `/api/prosti-termini?datum=YYYY-MM-DD&storitev_id=X` | Vrne proste termine za dan in storitev |
| `POST` | `/api/naroci-se` | Ustvari novo naročilo |
| `GET` | `/api/narocila?od=YYYY-MM-DD&do=YYYY-MM-DD&admin_token=X` | Vrne naročila v obdobju (admin) |
| `PATCH` | `/api/narocila/{id}/status?admin_token=X` | Posodobi status naročila (admin) |
| `POST` | `/api/admin/prijava` | Prijava v admin panel |
| `POST` | `/api/admin/odjava` | Odjava iz admin panela |

---

## 🔐 Admin dostop

Admin panel je dostopen na **http://localhost:5173/admin**.

**Privzeto geslo:** `satosek2024`

> ⚠️ V produkciji spremenite geslo v `backend/main.py` (spremenljivka `ADMIN_GESLO`).

---

## 🎨 Barvna shema

| Vloga | Barva | HEX |
|---|---|---|
| Primarna (zlata) | Topla zlata | `#C9A96E` |
| Poudarek (zlata 2) | Metallic gold | `#D4AF37` |
| Ozadje temno | Globoko temno | `#0A0A0A` · `#111111` · `#1A1A1A` |
| Besedilo svetlo | Bela / Siva | `#FFFFFF` · `#CCCCCC` |

---

## 📝 Licenca

© 2026 Igor Satošek s.p. — Vse pravice pridržane.

---

## 👨‍💻 Razvoj

Projekt je bil razvit za **Frizerski salon Satošek**, Nazorjeva ulica 9, 8340 Črnomelj, Slovenija.

**Kontakt salona:**
- 📞 051 651 007
- ✉️ satosek@amis.net
