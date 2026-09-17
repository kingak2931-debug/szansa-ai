-- Schemat CRM Fundacji Szansa AI dla Postgresa (Vercel Postgres / Neon).
-- Wdrożenie: psql "$DATABASE_URL" -f schema_postgres.sql
-- Odpowiada schematowi SQLite Jarvisa (jarvis/db.py) + rozszerzeniom CRM (crm.py).

BEGIN;

CREATE TABLE IF NOT EXISTS donors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    kind TEXT NOT NULL DEFAULT 'individual' CHECK (kind IN ('individual', 'company')),
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    consent_public_thanks BOOLEAN NOT NULL DEFAULT FALSE,   -- RODO: zgoda na publiczne podziękowania
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
    id BIGSERIAL PRIMARY KEY,
    donor_id BIGINT NOT NULL REFERENCES donors(id),
    amount_pln NUMERIC(12,2) NOT NULL CHECK (amount_pln > 0),
    donated_on DATE NOT NULL DEFAULT CURRENT_DATE,
    channel TEXT NOT NULL DEFAULT 'transfer'
        CHECK (channel IN ('transfer', 'online', 'event', 'crowdfunding')),
    purpose TEXT NOT NULL DEFAULT 'cele statutowe',
    certificate_no TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS donations_donated_on_idx ON donations (donated_on);

CREATE TABLE IF NOT EXISTS sponsors (
    id BIGSERIAL PRIMARY KEY,
    company TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    contact_email TEXT,
    package TEXT CHECK (package IN ('przyjaciel', 'regionalny', 'mecenas', 'strategiczny')),
    status TEXT NOT NULL DEFAULT 'lead'
        CHECK (status IN ('lead', 'contacted', 'meeting', 'offer', 'signed', 'declined')),
    pledged_pln NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    -- kolumny CRM:
    last_contact DATE,
    next_action TEXT,
    next_action_date DATE,
    sequence_step INTEGER NOT NULL DEFAULT 0 CHECK (sequence_step BETWEEN 0 AND 3),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sponsors_next_action_idx ON sponsors (next_action_date)
    WHERE next_action_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS schools (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'school' CHECK (kind IN ('school', 'gok', 'library', 'municipality')),
    town TEXT NOT NULL,
    population_band TEXT CHECK (population_band IN ('<5k', '5-10k', '10-20k', '>20k')),
    contact_name TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'zgloszenie'
        CHECK (status IN ('zgloszenie', 'rozmowa', 'porozumienie', 'pilotaz', 'semestr', 'odrzucone')),
    children_estimate INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS schools_status_idx ON schools (status);

-- Kolejka wychodząca: nic nie wychodzi automatycznie; 'approved' = zgoda operatora
-- na treść, finalna wysyłka to odrębna, również zatwierdzana akcja (crm.py send).
CREATE TABLE IF NOT EXISTS outbox (
    id BIGSERIAL PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('email', 'post')),
    recipient TEXT,
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'sent', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT now(),
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    approved_by_operator BOOLEAN NOT NULL DEFAULT TRUE
);

COMMIT;

-- RODO (uwaga operacyjna, nie DDL): tabele donors/schools/sponsors zawierają dane
-- osobowe. Dostęp do bazy produkcyjnej wyłącznie po SSL, konta imienne, kopie
-- zapasowe szyfrowane, retencja wg polityki prywatności fundacji.
