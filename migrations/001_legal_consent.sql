-- Records the 18+ confirmation and ToS/Privacy acceptance per user.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS over_18 boolean,
  ADD COLUMN IF NOT EXISTS tos_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS tos_version text;
