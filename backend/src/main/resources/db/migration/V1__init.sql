CREATE TABLE IF NOT EXISTS trails (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    distance_km DECIMAL(6, 2),
    difficulty  VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
