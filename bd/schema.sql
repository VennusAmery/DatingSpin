-- ============================================================
-- SPINDOCKY — Schema completo para Supabase (PostgreSQL)
-- ============================================================
-- Cómo usar:
-- 1. Ve a supabase.com y crea un proyecto gratis
-- 2. Ve a SQL Editor
-- 3. Pega todo este archivo y ejecuta
-- ============================================================


-- ── EXTENSIONES ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. USUARIOS (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  partner_id    UUID REFERENCES profiles(id),   -- pareja vinculada
  bio           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 2. DIARIO DE CITAS
-- ============================================================
CREATE TABLE diary_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  activity_id   TEXT,                         -- ID de la actividad de la ruleta
  date          DATE NOT NULL,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  feeling       TEXT,
  mood          TEXT,
  weather       TEXT,
  location      TEXT,
  with_who      TEXT,
  cost          TEXT,
  review        TEXT,
  changes       TEXT,
  is_shared     BOOLEAN DEFAULT FALSE,        -- visible para la pareja
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Fotos del diario (hasta 10 por entrada)
CREATE TABLE diary_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id      UUID REFERENCES diary_entries(id) ON DELETE CASCADE NOT NULL,
  storage_path  TEXT NOT NULL,               -- path en Supabase Storage
  url           TEXT,                        -- URL pública
  order_idx     SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 3. RULETA — IDEAS PERSONALIZADAS
-- ============================================================
CREATE TABLE custom_ideas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  emoji         TEXT DEFAULT '🎯',
  category      TEXT DEFAULT 'custom',
  is_enabled    BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- IDs deshabilitados de la ruleta (actividades base)
CREATE TABLE disabled_activities (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id   TEXT NOT NULL,
  PRIMARY KEY (user_id, activity_id)
);


-- ============================================================
-- 4. RECETAS PERSONALIZADAS
-- ============================================================
CREATE TABLE recipes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  emoji         TEXT DEFAULT '🍽️',
  servings      SMALLINT DEFAULT 2,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id     UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  qty           TEXT,
  order_idx     SMALLINT DEFAULT 0
);

CREATE TABLE recipe_steps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id     UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  instruction   TEXT NOT NULL,
  order_idx     SMALLINT DEFAULT 0
);


-- ============================================================
-- 5. ROMPEHIELOS — PREGUNTAS PERSONALIZADAS
-- ============================================================
CREATE TABLE custom_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category      TEXT NOT NULL,              -- divertidas, profundas, romanticas, retos, treinta6
  question      TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Preguntas ya usadas (para no repetir)
CREATE TABLE used_questions (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id   TEXT NOT NULL,              -- puede ser UUID o ID hardcodeado
  used_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);


-- ============================================================
-- 6. PLANIFICADOR DE CITAS
-- ============================================================
CREATE TABLE planned_dates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  activity_id   TEXT,
  date          DATE,
  time          TIME,
  location      TEXT,
  notes         TEXT,
  status        TEXT DEFAULT 'pending'      -- pending | done | cancelled
    CHECK (status IN ('pending','done','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 7. MENSAJES / NOTITAS ENTRE PAREJA
-- ============================================================
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content       TEXT,
  type          TEXT DEFAULT 'text'
    CHECK (type IN ('text','image','sticker','voice')),
  media_url     TEXT,                       -- URL si es imagen/voz
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation
  ON messages (LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id), created_at);


-- ============================================================
-- 8. GEOCODING CACHE (reemplaza geocache.json)
-- ============================================================
CREATE TABLE geocache (
  address       TEXT PRIMARY KEY,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 9. EVENTOS FAVORITOS
-- ============================================================
CREATE TABLE favorite_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id      TEXT NOT NULL,              -- ID del evento de ArchivoGT/Eventbrite
  source        TEXT NOT NULL,              -- archivogt | eventbrite
  title         TEXT,
  date          TIMESTAMPTZ,
  location      TEXT,
  url           TEXT,
  saved_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);


-- ============================================================
-- SEGURIDAD — Row Level Security (RLS)
-- Solo puedes ver/editar tus propios datos
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver perfil propio y pareja" ON profiles FOR SELECT USING (
  auth.uid() = id OR auth.uid() = partner_id OR
  id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Editar perfil propio" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Diary
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver entradas propias y compartidas de pareja" ON diary_entries FOR SELECT USING (
  user_id = auth.uid() OR
  (is_shared = TRUE AND user_id = (SELECT partner_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "CRUD entradas propias" ON diary_entries FOR ALL USING (user_id = auth.uid());

ALTER TABLE diary_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver fotos de entradas accesibles" ON diary_photos FOR SELECT USING (
  entry_id IN (SELECT id FROM diary_entries WHERE user_id = auth.uid())
);
CREATE POLICY "CRUD fotos propias" ON diary_photos FOR ALL USING (
  entry_id IN (SELECT id FROM diary_entries WHERE user_id = auth.uid())
);

-- Custom ideas
ALTER TABLE custom_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD ideas propias" ON custom_ideas FOR ALL USING (user_id = auth.uid());

ALTER TABLE disabled_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD disabled propios" ON disabled_activities FOR ALL USING (user_id = auth.uid());

-- Recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD recetas propias" ON recipes FOR ALL USING (user_id = auth.uid());

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD ingredientes propios" ON recipe_ingredients FOR ALL USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD pasos propios" ON recipe_steps FOR ALL USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);

-- Questions
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD preguntas propias" ON custom_questions FOR ALL USING (user_id = auth.uid());

ALTER TABLE used_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD usadas propias" ON used_questions FOR ALL USING (user_id = auth.uid());

-- Planner
ALTER TABLE planned_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD planes propios" ON planned_dates FOR ALL USING (user_id = auth.uid());

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver mensajes propios" ON messages FOR SELECT USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid()
);
CREATE POLICY "Enviar mensajes" ON messages FOR INSERT WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Marcar como leído" ON messages FOR UPDATE USING (to_user_id = auth.uid());

-- Geocache (público de lectura, solo server puede escribir)
ALTER TABLE geocache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leer geocache" ON geocache FOR SELECT USING (TRUE);

-- Favorites
ALTER TABLE favorite_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD favoritos propios" ON favorite_events FOR ALL USING (user_id = auth.uid());


-- ============================================================
-- REALTIME (para mensajes en tiempo real)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;


-- ============================================================
-- STORAGE BUCKETS
-- Ejecuta esto en el dashboard de Supabase > Storage
-- ============================================================
-- Bucket: diary-photos    → fotos del diario (privado)
-- Bucket: avatars         → fotos de perfil (público)
-- Bucket: message-media   → fotos/voz de mensajes (privado)


-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX idx_diary_user    ON diary_entries (user_id, date DESC);
CREATE INDEX idx_messages_to   ON messages (to_user_id, created_at DESC);
CREATE INDEX idx_messages_from ON messages (from_user_id, created_at DESC);
CREATE INDEX idx_planned_user  ON planned_dates (user_id, date ASC);
CREATE INDEX idx_recipes_user  ON recipes (user_id);
CREATE INDEX idx_questions_cat ON custom_questions (user_id, category);
