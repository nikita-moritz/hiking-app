CREATE TABLE events (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    trail_id         BIGINT REFERENCES trails(id) ON DELETE SET NULL,
    organizer_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    organizer_name   VARCHAR(255),
    event_date       TIMESTAMP NOT NULL,
    max_participants INT DEFAULT 10,
    status           VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming','cancelled','completed')),
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    location_name    VARCHAR(255),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
