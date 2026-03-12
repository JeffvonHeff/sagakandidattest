-- Harden RLS policies for public launch
-- All candidates have submitted; quiz-takers only need read access to quiz data
-- and write access to user_answers.
--
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Drop seeding policies on questions (seed via service role if needed)
DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
DROP POLICY IF EXISTS "anon_update_questions" ON questions;

-- 2. Drop write policies on candidate_answers (all politicians have submitted)
DROP POLICY IF EXISTS "anon_insert_candidate_answers" ON candidate_answers;
DROP POLICY IF EXISTS "anon_update_candidate_answers" ON candidate_answers;

-- 3. Revoke anon EXECUTE on politician-form RPCs (no longer needed publicly)
REVOKE EXECUTE ON FUNCTION verify_candidate_token(TEXT)  FROM anon;
REVOKE EXECUTE ON FUNCTION mark_token_used(TEXT)         FROM anon;
REVOKE EXECUTE ON FUNCTION update_candidate_profile(TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM anon;

-- What remains for anon:
--   questions:         SELECT only
--   candidates:        SELECT only
--   candidate_answers: SELECT only
--   user_answers:      INSERT only (quiz-takers submit answers)
--   candidate_tokens:  no access (no anon policies)
