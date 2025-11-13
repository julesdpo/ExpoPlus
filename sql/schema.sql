-- =============================================================
--  🚀 CULTURAL EXPLORER — PostgreSQL Schema
--  Tables: users, venues, exhibitions, favorites
-- =============================================================

-- ========================
--  EXTENSIONS (Optional)
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
--  USERS
-- ========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================
--  VENUES
-- ========================
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(150),
    zipcode VARCHAR(20),
    
    -- Geographic coordinates (WGS84)
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,

    source VARCHAR(50),
    source_id VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEX GEO (pour radius search)
CREATE INDEX idx_venues_lat_lon ON venues(lat, lon);

-- ========================
--  EXHIBITIONS
-- ========================
CREATE TABLE exhibitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    description TEXT,

    start_date DATE,
    end_date DATE,

    price_min NUMERIC(10,2),
    price_max NUMERIC(10,2),
    currency VARCHAR(10),

    url TEXT,
    image_url TEXT,

    tags TEXT,

    source VARCHAR(50),
    source_id VARCHAR(255),

    updated_at TIMESTAMP DEFAULT NOW(),

    status VARCHAR(50) CHECK (status IN ('scheduled', 'ongoing', 'finished'))
);

-- Index pour filtrer par source_id
CREATE INDEX idx_exhibitions_source ON exhibitions(source, source_id);

-- ========================
--  FAVORITES
-- ========================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Un utilisateur ne peut pas liker deux fois la même expo
    UNIQUE (user_id, exhibition_id)
);

-- Index utilisateur -> favoris
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Index expo -> favoris
CREATE INDEX idx_favorites_exhibition ON favorites(exhibition_id);
