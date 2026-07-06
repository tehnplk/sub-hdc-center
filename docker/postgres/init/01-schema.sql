-- sub_hdc_center schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS c_district (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS benchmark_district (
  id SERIAL PRIMARY KEY,
  district VARCHAR(50) NOT NULL UNIQUE,
  system_on SMALLINT DEFAULT 0,
  hos_moph_all INTEGER DEFAULT 0,
  hos_moph_send INTEGER DEFAULT 0,
  hos_loc_all INTEGER DEFAULT 0,
  hos_loc_send INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS data_sync_in (
  id BIGSERIAL PRIMARY KEY,
  payload JSONB NOT NULL,
  date_time_sync TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sub_version (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  issue TEXT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sync_in_date_time_sync ON data_sync_in (date_time_sync);
