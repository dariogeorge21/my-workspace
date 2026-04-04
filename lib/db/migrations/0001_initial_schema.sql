-- 0001_initial_schema.sql
-- Compatibility-first baseline migration for Workspace Manager.
-- This matches the current app schema and adds non-breaking indexes for existing query patterns.
--
-- Prerequisites:
-- 1) PostgreSQL (Neon)
-- 2) Ability to create extensions in the target database
--
-- Safe re-run behavior:
-- - Uses IF NOT EXISTS for extensions, tables, and indexes.
-- - Does not alter existing columns/constraints.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS app_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading varchar(255) NOT NULL,
  content text NOT NULL,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading varchar(255) NOT NULL,
  content text NOT NULL,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_name varchar(255) NOT NULL,
  username varchar(255) NOT NULL,
  encrypted_password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  storage_mode varchar(50) NOT NULL,
  file_content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorite_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command_name varchar(255) NOT NULL,
  command text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_name varchar(255) NOT NULL,
  application_url text NOT NULL,
  icon_url text,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_preference varchar(50) NOT NULL DEFAULT 'system',
  quick_nav_settings jsonb,
  dashboard_stats_settings jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sort indexes used by list screens.
CREATE INDEX IF NOT EXISTS idx_app_prompts_updated_at_desc ON app_prompts (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_prompts_updated_at_desc ON personal_prompts (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_entries_updated_at_desc ON password_entries (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_files_updated_at_desc ON personal_files (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_commands_updated_at_desc ON favorite_commands (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_apps_sort_order_desc ON dashboard_apps (sort_order DESC);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at_desc ON user_settings (updated_at DESC);

-- Search indexes for ILIKE patterns in current actions.
CREATE INDEX IF NOT EXISTS idx_app_prompts_heading_trgm ON app_prompts USING gin (heading gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_app_prompts_content_trgm ON app_prompts USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_personal_prompts_heading_trgm ON personal_prompts USING gin (heading gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_personal_prompts_content_trgm ON personal_prompts USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_password_entries_application_name_trgm ON password_entries USING gin (application_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_password_entries_username_trgm ON password_entries USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_personal_files_file_name_trgm ON personal_files USING gin (file_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_personal_files_category_trgm ON personal_files USING gin (category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_favorite_commands_command_name_trgm ON favorite_commands USING gin (command_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_favorite_commands_command_trgm ON favorite_commands USING gin (command gin_trgm_ops);

COMMIT;
