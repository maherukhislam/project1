-- ============================================================================
-- FIX: RLS Auth Init Plan Performance
-- ============================================================================
-- This script fixes RLS policies that re-evaluate auth.uid() and is_admin()
-- for each row. By wrapping these calls in (select ...), they are evaluated
-- once per query instead of per row, improving performance at scale.
-- ============================================================================

-- ── PROFILES ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Profiles select own or admin" ON profiles;
CREATE POLICY "Profiles select own or admin" ON profiles
  FOR SELECT USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Profiles insert own or admin" ON profiles;
CREATE POLICY "Profiles insert own or admin" ON profiles
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Profiles update own or admin" ON profiles;
CREATE POLICY "Profiles update own or admin" ON profiles
  FOR UPDATE USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

-- ── DOCUMENTS ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Documents select own or admin" ON documents;
CREATE POLICY "Documents select own or admin" ON documents
  FOR SELECT USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Documents insert own" ON documents;
CREATE POLICY "Documents insert own" ON documents
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Documents update own or admin" ON documents;
CREATE POLICY "Documents update own or admin" ON documents
  FOR UPDATE USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Documents delete own or admin" ON documents;
CREATE POLICY "Documents delete own or admin" ON documents
  FOR DELETE USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

-- ── APPLICATIONS ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Applications select own or admin" ON applications;
CREATE POLICY "Applications select own or admin" ON applications
  FOR SELECT USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Applications insert own or admin" ON applications;
CREATE POLICY "Applications insert own or admin" ON applications
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Applications update own or admin" ON applications;
CREATE POLICY "Applications update own or admin" ON applications
  FOR UPDATE USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Applications delete own or admin" ON applications;
CREATE POLICY "Applications delete own or admin" ON applications
  FOR DELETE USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin" ON notifications
  FOR INSERT WITH CHECK (
    (select is_admin())
  );

-- ── AUDIT_LOGS ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Audit logs select own or admin" ON audit_logs;
CREATE POLICY "Audit logs select own or admin" ON audit_logs
  FOR SELECT USING (
    user_id = (select auth.uid()) OR (select is_admin())
  );

DROP POLICY IF EXISTS "Audit logs insert own or admin" ON audit_logs;
CREATE POLICY "Audit logs insert own or admin" ON audit_logs
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid()) OR (select is_admin())
  );

-- ── NOTES ────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Notes select staff" ON notes;
CREATE POLICY "Notes select staff" ON notes
  FOR SELECT USING (
    (select is_admin()) OR (select is_counselor())
  );

DROP POLICY IF EXISTS "Notes insert staff" ON notes;
CREATE POLICY "Notes insert staff" ON notes
  FOR INSERT WITH CHECK (
    (select is_admin()) OR (select is_counselor())
  );

-- ============================================================================
-- END OF FIX
-- ============================================================================
