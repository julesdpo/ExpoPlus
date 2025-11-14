DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;


-- Vérifie que l'extension uuid-ossp est installée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--  USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

--  VENUES
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    city VARCHAR(150),
    zipcode VARCHAR(20),

    -- Geographic coordinates
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,

    source VARCHAR(50),          -- 'paris_musees', 'opendata_paris'
    source_id VARCHAR(255),      -- ID fourni par l'API
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_venues_lat_lon ON venues(lat, lon);
CREATE INDEX idx_venues_source_id ON venues(source, source_id);

--  EXHIBITIONS
CREATE TABLE exhibitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    description TEXT,

    start_date DATE,
    end_date DATE,

    price_min NUMERIC(10,2),
    price_max NUMERIC(10,2),
    currency TEXT, 
    url TEXT,
    image_url TEXT,

    tags TEXT,

    source VARCHAR(50),
    source_id VARCHAR(255),

    updated_at TIMESTAMP DEFAULT NOW(),

    status VARCHAR(50) CHECK (status IN ('scheduled', 'ongoing', 'finished'))
);

CREATE INDEX idx_exhibitions_source ON exhibitions(source, source_id);

--  FAVORITES
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, exhibition_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_exhibition ON favorites(exhibition_id);

--  CONSTRAINTS
-- Unique constraint on source_id to avoid duplicates
ALTER TABLE venues
ADD CONSTRAINT venues_source_uid UNIQUE (source, source_id);

ALTER TABLE exhibitions
ADD CONSTRAINT exhibitions_source_uid UNIQUE (source, source_id);
