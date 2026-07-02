-- WARNING: Drops all data. Run in Neon console only when you want a clean slate.

DROP TABLE IF EXISTS orders       CASCADE;
DROP TABLE IF EXISTS usage_logs   CASCADE;
DROP TABLE IF EXISTS user_plans   CASCADE;
DROP TABLE IF EXISTS api_keys     CASCADE;
DROP TABLE IF EXISTS users        CASCADE;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  key_hash     TEXT UNIQUE NOT NULL,
  key_prefix   TEXT NOT NULL,
  name         TEXT DEFAULT 'Default',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_plans (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan             TEXT DEFAULT 'free',
  credits_balance  INTEGER DEFAULT 500,
  credits_monthly  INTEGER DEFAULT 500,
  topup_balance    INTEGER DEFAULT 0,
  topup_expires_at TIMESTAMPTZ,
  cycle_reset_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_logs (
  id           SERIAL PRIMARY KEY,
  api_key_id   INTEGER REFERENCES api_keys(id),
  user_id      INTEGER REFERENCES users(id),
  endpoint     TEXT NOT NULL,
  status_code  INTEGER NOT NULL,
  latency_ms   INTEGER,
  credits_used INTEGER DEFAULT 0,
  target_url   TEXT,
  source       TEXT DEFAULT 'api',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id                  TEXT PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id),
  product_id          TEXT NOT NULL,
  credits             INTEGER NOT NULL,
  amount              INTEGER NOT NULL,
  currency            TEXT DEFAULT 'INR',
  status              TEXT DEFAULT 'pending',
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  paid_at             TIMESTAMPTZ
);

CREATE INDEX idx_usage_user_time  ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_key        ON usage_logs(api_key_id);
CREATE INDEX idx_orders_user      ON orders(user_id);
