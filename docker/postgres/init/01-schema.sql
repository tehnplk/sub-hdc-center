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
  sub_center_name VARCHAR(255) NULL,
  topic VARCHAR(255) NULL,
  date_time_sync TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_data_sync_in_center_topic UNIQUE (sub_center_name, topic)
);

CREATE TABLE IF NOT EXISTS sub_version (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  issue TEXT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sync_in_date_time_sync ON data_sync_in (date_time_sync);

CREATE TABLE IF NOT EXISTS sql_for_sync_data (
  id BIGSERIAL PRIMARY KEY,
  kpi_name VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NULL,
  kpi_group VARCHAR(255) NULL,
  interval_minute INTEGER NULL,
  tables_use TEXT[] NOT NULL DEFAULT '{}'::text[],
  sql_command TEXT NOT NULL,
  note TEXT NULL,
  d_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sql_for_sync_data_topic
  ON sql_for_sync_data (topic);

CREATE INDEX IF NOT EXISTS idx_sql_for_sync_data_kpi_name
  ON sql_for_sync_data (kpi_name);

CREATE INDEX IF NOT EXISTS idx_sql_for_sync_data_active
  ON sql_for_sync_data (is_active);
