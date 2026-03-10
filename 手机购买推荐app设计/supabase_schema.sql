-- ============================================================
-- GripFit Supabase Database Schema (完整版)
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本
-- 可重复执行（使用 IF NOT EXISTS / OR REPLACE）
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. 用户资料表 profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 注册时自动建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 2. 手机数据库表 phones
--    id 使用 TEXT（与前端 phoneData.ts 的 '1','2'... 对齐）
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS phones (
  id             TEXT PRIMARY KEY,
  name           TEXT    NOT NULL,
  brand          TEXT    NOT NULL,
  image          TEXT    DEFAULT '',
  width          REAL    NOT NULL,
  height         REAL    NOT NULL,
  thickness      REAL    NOT NULL,
  weight         INTEGER NOT NULL,
  screen_size    REAL    NOT NULL,
  price          INTEGER NOT NULL DEFAULT 0,
  grip_score     INTEGER DEFAULT 0,
  reach_score    INTEGER DEFAULT 0,
  comfort_score  INTEGER DEFAULT 0,
  overall_score  INTEGER DEFAULT 0,
  material       TEXT    DEFAULT '',
  features       JSONB   DEFAULT '[]'::jsonb,
  back_material        TEXT,
  camera_position      TEXT,
  camera_shape         TEXT,
  camera_bump_height   REAL,
  battery        INTEGER,
  storage        JSONB,
  form_factor    TEXT    DEFAULT 'bar'
                   CHECK (form_factor IN ('bar','flip','fold')),
  corner_radius  REAL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Phones are viewable by everyone" ON phones;
CREATE POLICY "Phones are viewable by everyone"
  ON phones FOR SELECT USING (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_phones_brand         ON phones(brand);
CREATE INDEX IF NOT EXISTS idx_phones_overall_score ON phones(overall_score DESC);


-- ─────────────────────────────────────────────
-- 3. 手部测量记录表 measurements
--    注意：grip_strength / dominant_hand 已从业务层移除，此处不建这两列
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS measurements (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hand_length   REAL    NOT NULL,
  hand_width    REAL    NOT NULL,
  thumb_length  REAL    NOT NULL,
  index_length  REAL    NOT NULL,
  middle_length REAL    NOT NULL,
  thumb_span    REAL    NOT NULL,
  hand_size     TEXT    DEFAULT 'medium',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own measurements"   ON measurements;
DROP POLICY IF EXISTS "Users can insert own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can delete own measurements" ON measurements;
CREATE POLICY "Users can view own measurements"
  ON measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements"
  ON measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own measurements"
  ON measurements FOR DELETE USING (auth.uid() = user_id);

-- 索引
CREATE INDEX IF NOT EXISTS idx_measurements_user_id    ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements(created_at DESC);


-- ─────────────────────────────────────────────
-- 4. 推荐报告表 reports
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_id      UUID  REFERENCES measurements(id) ON DELETE SET NULL,
  selected_phone_ids  JSONB DEFAULT '[]'::jsonb,
  ranked_results      JSONB DEFAULT '[]'::jsonb,
  preset_used         TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own reports"   ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);


-- ─────────────────────────────────────────────
-- 5. 收藏表 favorites
--    phone_id 为 TEXT，与 phones.id 类型对齐
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_id   TEXT NOT NULL REFERENCES phones(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, phone_id)
);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites"   ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);


-- ─────────────────────────────────────────────
-- 6. 评分公式表 scoring_formulas
--    存储二次回归系数 f(x) = a·x² + b·x + c
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoring_formulas (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  score_type  TEXT  NOT NULL DEFAULT 'comfort',  -- 'comfort' | 'reach' | ...
  user_group  TEXT  NOT NULL DEFAULT 'default',  -- 'default' | 'small_hand' | ...
  phone_param TEXT  NOT NULL,                    -- 'width' | 'height' | 'weight' | ...
  coeff_a     FLOAT NOT NULL DEFAULT 0,
  coeff_b     FLOAT NOT NULL DEFAULT 0,
  coeff_c     FLOAT NOT NULL DEFAULT 0,
  description TEXT  DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(score_type, user_group, phone_param)
);

-- RLS
ALTER TABLE scoring_formulas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read formulas"        ON scoring_formulas;
DROP POLICY IF EXISTS "Authenticated users can modify formulas" ON scoring_formulas;
DROP POLICY IF EXISTS "Enable ALL operations for everyone on formulas" ON scoring_formulas;

CREATE POLICY "Enable ALL operations for everyone on formulas"
  ON scoring_formulas FOR ALL USING (true) WITH CHECK (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_scoring_formulas_type ON scoring_formulas(score_type, user_group);


-- ─────────────────────────────────────────────
-- 7. 分类偏好表 categorical_preferences
--    用于摄像模组形状等无法线性量化的偏好评分
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorical_preferences (
  id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  score_type        TEXT  NOT NULL DEFAULT 'comfort',
  user_group        TEXT  NOT NULL DEFAULT 'default',
  category          TEXT  NOT NULL,   -- 'camera_shape' | 'back_material' | 'form_factor'
  category_value    TEXT  NOT NULL,   -- '方形岛' | '磨砂玻璃' | ...
  preference_score  FLOAT NOT NULL DEFAULT 50,  -- 0~100
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(score_type, user_group, category, category_value)
);

-- RLS
ALTER TABLE categorical_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read preferences"               ON categorical_preferences;
DROP POLICY IF EXISTS "Authenticated users can modify preferences" ON categorical_preferences;
DROP POLICY IF EXISTS "Enable ALL operations for everyone on preferences" ON categorical_preferences;

CREATE POLICY "Enable ALL operations for everyone on preferences"
  ON categorical_preferences FOR ALL USING (true) WITH CHECK (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cat_prefs_type ON categorical_preferences(score_type, user_group, category);
