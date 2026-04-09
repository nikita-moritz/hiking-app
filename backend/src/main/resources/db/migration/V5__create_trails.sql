DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS trails CASCADE;

CREATE TABLE trails (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    location     VARCHAR(255),
    distance_km  DECIMAL(6,2),
    difficulty   VARCHAR(20) CHECK (difficulty IN ('Easy','Medium','Hard')),
    latitude     DOUBLE PRECISION,
    longitude    DOUBLE PRECISION,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
