-- Run once in your Neon console to set up the schema

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  key_hash     TEXT UNIQUE NOT NULL,
  key_prefix   TEXT NOT NULL,
  name         TEXT DEFAULT 'Default',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_plans (
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

CREATE TABLE IF NOT EXISTS usage_logs (
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

CREATE TABLE IF NOT EXISTS orders (
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

CREATE INDEX IF NOT EXISTS idx_usage_user_time  ON usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_key        ON usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id);
