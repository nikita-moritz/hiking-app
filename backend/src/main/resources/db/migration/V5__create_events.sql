CREATE TABLE IF NOT EXISTS events (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      VARCHAR(2000),
    trail_id         BIGINT REFERENCES trails(id),
    organizer_id     BIGINT NOT NULL REFERENCES users(id),
    event_date       TIMESTAMP NOT NULL,
    max_participants INT NOT NULL DEFAULT 10,
    status           VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_participants (
    id         BIGSERIAL PRIMARY KEY,
    event_id   BIGINT NOT NULL REFERENCES events(id),
    user_id    BIGINT NOT NULL REFERENCES users(id),
    status     VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, user_id)
);
