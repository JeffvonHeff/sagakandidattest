-- Token-gated politician form
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. candidate_tokens: keeps tokens + emails separate from the public candidates table
CREATE TABLE IF NOT EXISTS candidate_tokens (
  candidate_id UUID PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  token        TEXT NOT NULL UNIQUE,
  email        TEXT DEFAULT '',
  used_at      TIMESTAMPTZ
);

ALTER TABLE candidate_tokens ENABLE ROW LEVEL SECURITY;
-- No anon policies → tokens are never exposed via the REST API

-- 2. RPC: verify a token and return candidate info (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION verify_candidate_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT c.id, c.name, c.party, c.area, ct.used_at
  INTO rec
  FROM candidate_tokens ct
  JOIN candidates c ON c.id = ct.candidate_id
  WHERE ct.token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'invalid_token');
  END IF;

  RETURN json_build_object(
    'id', rec.id,
    'name', rec.name,
    'party', rec.party,
    'area', rec.area,
    'already_submitted', rec.used_at IS NOT NULL
  );
END;
$$;

-- 3. RPC: mark token as used after successful submission
CREATE OR REPLACE FUNCTION mark_token_used(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE candidate_tokens SET used_at = now() WHERE token = p_token;
END;
$$;

-- 4. Photo consent column on candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN NOT NULL DEFAULT false;

-- 5. RPC: update candidate profile fields (for candidates with missing data)
CREATE OR REPLACE FUNCTION update_candidate_profile(p_token TEXT, p_name TEXT, p_party TEXT, p_area TEXT, p_photo_consent BOOLEAN DEFAULT false)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cid UUID;
BEGIN
  SELECT ct.candidate_id INTO cid
  FROM candidate_tokens ct
  WHERE ct.token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  UPDATE candidates
  SET name  = COALESCE(NULLIF(p_name, ''), name),
      party = COALESCE(NULLIF(p_party, ''), party),
      area  = COALESCE(NULLIF(p_area, ''), area),
      photo_consent = p_photo_consent
  WHERE id = cid;
END;
$$;

-- 5. Remove old open-write policies on candidates (now pre-seeded, writes go through RPCs)
DROP POLICY IF EXISTS "anon_insert_candidates"        ON candidates;
DROP POLICY IF EXISTS "anon_update_candidates"        ON candidates;
