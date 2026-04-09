ALTER TABLE events
    ADD COLUMN IF NOT EXISTS title_en  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS title_ru  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS title_de  VARCHAR(255);

-- Existing title (stored in Russian) → title_ru
UPDATE events SET title_ru = title WHERE title_ru IS NULL;
