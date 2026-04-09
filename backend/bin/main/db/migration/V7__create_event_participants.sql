CREATE TABLE event_participants (
    id        BIGSERIAL PRIMARY KEY,
    event_id  BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status    VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);
