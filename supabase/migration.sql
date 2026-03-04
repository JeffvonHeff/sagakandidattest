-- Kandidattest database schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Questions: the final 20-30 statements
CREATE TABLE IF NOT EXISTS questions (
  id            TEXT PRIMARY KEY,
  topic         TEXT NOT NULL DEFAULT '',
  text          TEXT NOT NULL,
  explain       TEXT DEFAULT '',
  default_weight INTEGER NOT NULL DEFAULT 2,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- 2. Candidates: politician profiles
CREATE TABLE IF NOT EXISTS candidates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  party      TEXT NOT NULL DEFAULT '',
  area       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidates_name_area_key UNIQUE (name, area)
);

-- 3. Candidate answers: one row per candidate per question
CREATE TABLE IF NOT EXISTS candidate_answers (
  candidate_id UUID    NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  question_id  TEXT    NOT NULL REFERENCES questions(id)   ON DELETE CASCADE,
  value        INTEGER NOT NULL CHECK (value BETWEEN -2 AND 2),
  stance       TEXT    DEFAULT '',
  PRIMARY KEY (candidate_id, question_id)
);

-- 4. User answers: quiz-taker responses (write-only for anon)
CREATE TABLE IF NOT EXISTS user_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL,
  question_id       TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value             INTEGER NOT NULL CHECK (value BETWEEN -2 AND 2),
  importance_weight INTEGER NOT NULL DEFAULT 2 CHECK (importance_weight BETWEEN 1 AND 3),
  area              TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_answers_session    ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_candidate_answers_cand  ON candidate_answers(candidate_id);

-- Enable Row Level Security on all tables
ALTER TABLE questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers      ENABLE ROW LEVEL SECURITY;

-- Public read for quiz data
CREATE POLICY "anon_read_questions"         ON questions         FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_candidates"        ON candidates        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_candidate_answers" ON candidate_answers FOR SELECT TO anon USING (true);

-- Seeding: allow insert+update on questions (revoke in production if desired)
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Candidate answers: allow anon insert+update (the politician form submits via anon key,
-- but only after token verification through SECURITY DEFINER RPCs)
CREATE POLICY "anon_insert_candidate_answers" ON candidate_answers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_candidate_answers" ON candidate_answers FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- NOTE: candidates table no longer has anon insert/update policies.
-- Candidates are pre-seeded via service role key; profile updates go through
-- the update_candidate_profile RPC (SECURITY DEFINER). See migration-002-tokens.sql.

-- Quiz users: write-only access to user_answers
CREATE POLICY "anon_insert_user_answers" ON user_answers FOR INSERT TO anon WITH CHECK (true);
