DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- USERS
---------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

---------------------------------------------------------
-- REFRESH TOKENS (NEW)
---------------------------------------------------------
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

---------------------------------------------------------
-- VENUES
---------------------------------------------------------
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    city VARCHAR(150),
    zipcode VARCHAR(20),
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    source VARCHAR(50),
    source_id VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_venues_lat_lon ON venues(lat, lon);
CREATE INDEX idx_venues_source_id ON venues(source, source_id);

ALTER TABLE venues
ADD CONSTRAINT venues_source_uid UNIQUE (source, source_id);

---------------------------------------------------------
-- EXHIBITIONS
---------------------------------------------------------
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

ALTER TABLE exhibitions
ADD CONSTRAINT exhibitions_source_uid UNIQUE (source, source_id);

---------------------------------------------------------
-- FAVORITES
---------------------------------------------------------
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, exhibition_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_exhibition ON favorites(exhibition_id);
