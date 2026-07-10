-- KPI extraction commands for 43-file MariaDB/MySQL clients.
-- Commands intentionally contain no SET statements.

INSERT INTO sql_for_sync_data
  (id, kpi_name, topic, kpi_group, interval_minute, tables_use, sql_command, note, d_update, is_active)
VALUES
  (
    3,
    'คัดกรองความดันโลหิตสูง',
    'screening_bp',
    'screening',
    NULL,
    ARRAY['person', 'ncdscreen'],
    $sql$
WITH target AS (
  SELECT hospcode, pid
  FROM person
  WHERE typearea IN ('1', '3')
    AND discharge = '9'
    AND birth <= '19910930'
  GROUP BY hospcode, pid
),
bp_ranked AS (
  SELECT
    n.hospcode,
    n.pid,
    CAST(TRIM(n.sbp_1) AS DECIMAL(10,2)) AS sbp,
    CAST(TRIM(n.dbp_1) AS DECIMAL(10,2)) AS dbp,
    ROW_NUMBER() OVER (
      PARTITION BY n.hospcode, n.pid
      ORDER BY n.date_serv DESC, n.seq DESC
    ) AS rn
  FROM ncdscreen n
  WHERE n.date_serv BETWEEN '20251001' AND '20260930'
    AND TRIM(COALESCE(n.sbp_1, '')) REGEXP '^[0-9]+([.][0-9]+)?$'
    AND TRIM(COALESCE(n.dbp_1, '')) REGEXP '^[0-9]+([.][0-9]+)?$'
),
screen AS (
  SELECT hospcode, pid, sbp, dbp
  FROM bp_ranked
  WHERE rn = 1
),
agg AS (
  SELECT
    h.amp_name AS district,
    h.hospcode,
    h.hospname,
    h.hostype,
    COUNT(DISTINCT t.pid) AS target_count,
    COUNT(DISTINCT s.pid) AS screened_count,
    COUNT(DISTINCT CASE
      WHEN s.sbp < 130 AND s.dbp < 80 THEN s.pid
    END) AS normal_count,
    COUNT(DISTINCT CASE
      WHEN s.sbp < 140 AND s.dbp < 90
       AND (s.sbp >= 130 OR s.dbp >= 80) THEN s.pid
    END) AS risk_count,
    COUNT(DISTINCT CASE
      WHEN (s.sbp >= 140 AND s.sbp < 180)
        OR (s.dbp >= 90 AND s.dbp < 110) THEN s.pid
    END) AS suspected_count
  FROM target t
  JOIN c_hospital h ON h.hospcode = t.hospcode
  LEFT JOIN screen s ON s.hospcode = t.hospcode AND s.pid = t.pid
  WHERE h.is_active = TRUE
  GROUP BY h.amp_name, h.hospcode, h.hospname, h.hostype
)
SELECT
  district,
  hospcode,
  hospname,
  hostype,
  target_count,
  screened_count,
  normal_count,
  risk_count,
  suspected_count,
  ROUND(100.0 * screened_count / NULLIF(target_count, 0), 2) AS screening_percent
FROM agg
ORDER BY district, hospcode
$sql$,
    'Population type 1/3 aged 35+ at 2026-09-30; latest valid BP screening in fiscal year 2569.',
    NOW(),
    TRUE
  ),
  (
    4,
    'คัดกรองโรคเบาหวาน',
    'screening_dm',
    'screening',
    NULL,
    ARRAY['person', 'ncdscreen', 'chronic'],
    $sql$
WITH registered_dm AS (
  SELECT cid
  FROM chronic
  WHERE LEFT(REPLACE(UPPER(TRIM(chronic)), '.', ''), 3)
    IN ('E10', 'E11', 'E12', 'E13', 'E14')
    AND NULLIF(TRIM(cid), '') IS NOT NULL
  GROUP BY cid
),
target AS (
  SELECT hospcode, pid, cid
  FROM person
  WHERE typearea IN ('1', '3')
    AND discharge = '9'
    AND birth <= '19910930'
    AND NULLIF(TRIM(cid), '') IS NOT NULL
    AND cid NOT IN (SELECT cid FROM registered_dm)
  GROUP BY hospcode, pid, cid
),
glucose_ranked AS (
  SELECT
    n.cid,
    CAST(TRIM(n.bslevel) AS DECIMAL(10,2)) AS bslevel,
    COALESCE(NULLIF(TRIM(n.bstest), ''), '1') AS bstest,
    ROW_NUMBER() OVER (
      PARTITION BY n.cid
      ORDER BY n.date_serv DESC, n.seq DESC
    ) AS rn
  FROM ncdscreen n
  WHERE n.date_serv BETWEEN '20251001' AND '20260930'
    AND NULLIF(TRIM(n.cid), '') IS NOT NULL
    AND TRIM(COALESCE(n.bslevel, '')) REGEXP '^[0-9]+([.][0-9]+)?$'
    AND CAST(TRIM(n.bslevel) AS DECIMAL(10,2)) >= 50
),
screen AS (
  SELECT cid, bslevel, bstest
  FROM glucose_ranked
  WHERE rn = 1
),
agg AS (
  SELECT
    h.amp_name AS district,
    h.hospcode,
    h.hospname,
    h.hostype,
    COUNT(DISTINCT t.pid) AS target_count,
    COUNT(DISTINCT CASE WHEN s.cid IS NOT NULL THEN t.pid END) AS screened_count,
    COUNT(DISTINCT CASE
      WHEN s.bslevel >= 70
       AND (
         (s.bstest = '1' AND s.bslevel < 100)
         OR (s.bstest <> '1' AND s.bslevel < 110)
       ) THEN t.pid
    END) AS normal_count,
    COUNT(DISTINCT CASE
      WHEN (
         s.bstest = '1'
         AND s.bslevel >= 100
         AND s.bslevel < 126
       ) OR (
         s.bstest <> '1'
         AND s.bslevel >= 110
       ) THEN t.pid
    END) AS risk_count,
    COUNT(DISTINCT CASE
      WHEN s.bstest = '1'
       AND s.bslevel >= 126 THEN t.pid
    END) AS suspected_count,
    COUNT(DISTINCT CASE
      WHEN s.bslevel >= 50
       AND s.bslevel < 70 THEN t.pid
    END) AS out_of_criteria_count
  FROM target t
  JOIN c_hospital h ON h.hospcode = t.hospcode
  LEFT JOIN screen s ON s.cid = t.cid
  WHERE h.is_active = TRUE
  GROUP BY h.amp_name, h.hospcode, h.hospname, h.hostype
)
SELECT
  district,
  hospcode,
  hospname,
  hostype,
  target_count,
  screened_count,
  normal_count,
  risk_count,
  suspected_count,
  out_of_criteria_count,
  ROUND(100.0 * screened_count / NULLIF(target_count, 0), 2) AS screening_percent
FROM agg
ORDER BY district, hospcode
$sql$,
    'Population type 1/3 aged 35+ at 2026-09-30, discharge 9, excluding registered diabetes; latest valid NCDSCREEN glucose >=50 by CID in fiscal year 2569; missing BSTEST is treated as fasting.',
    NOW(),
    TRUE
  ),
  (
    5,
    'ควบคุมโรคเบาหวาน',
    'chronic',
    'chronic',
    NULL,
    ARRAY['person', 'diagnosis_opd', 'diagnosis_ipd', 'labfu'],
    $sql$
WITH diagnosed AS (
  SELECT cid
  FROM diagnosis_opd
  WHERE date_serv <= '20260930'
    AND LEFT(REPLACE(UPPER(TRIM(diagcode)), '.', ''), 4)
      IN ('E112', 'E113', 'E114', 'E116', 'E117', 'E118')
    AND NULLIF(TRIM(cid), '') IS NOT NULL
  GROUP BY cid

  UNION

  SELECT cid
  FROM diagnosis_ipd
  WHERE LEFT(datetime_admit, 8) <= '20260930'
    AND LEFT(REPLACE(UPPER(TRIM(diagcode)), '.', ''), 4)
      IN ('E112', 'E113', 'E114', 'E116', 'E117', 'E118')
    AND NULLIF(TRIM(cid), '') IS NOT NULL
  GROUP BY cid
),
dm_target AS (
  SELECT p.hospcode, p.pid, p.cid
  FROM person p
  JOIN diagnosed d ON d.cid = p.cid
  WHERE p.typearea IN ('1', '3')
    AND p.discharge = '9'
    AND NULLIF(TRIM(p.cid), '') IS NOT NULL
  GROUP BY p.hospcode, p.pid, p.cid
),
hba1c_ranked AS (
  SELECT
    l.cid,
    CAST(TRIM(l.labresult) AS DECIMAL(10,2)) AS hba1c_value,
    ROW_NUMBER() OVER (
      PARTITION BY l.cid
      ORDER BY l.date_serv DESC, l.seq DESC
    ) AS rn
  FROM labfu l
  WHERE l.date_serv BETWEEN '20251001' AND '20260930'
    AND l.labtest = '0531601'
    AND NULLIF(TRIM(l.cid), '') IS NOT NULL
    AND TRIM(COALESCE(l.labresult, '')) REGEXP '^[0-9]+([.][0-9]+)?$'
),
latest_hba1c AS (
  SELECT cid, hba1c_value
  FROM hba1c_ranked
  WHERE rn = 1
),
agg AS (
  SELECT
    h.amp_name AS district,
    h.hospcode,
    h.hospname,
    h.hostype,
    COUNT(DISTINCT d.cid) AS target_count,
    COUNT(DISTINCT a.cid) AS tested_count,
    COUNT(DISTINCT CASE WHEN a.hba1c_value < 6.5 THEN d.cid END) AS controlled_count
  FROM dm_target d
  JOIN c_hospital h ON h.hospcode = d.hospcode
  LEFT JOIN latest_hba1c a ON a.cid = d.cid
  WHERE h.is_active = TRUE
  GROUP BY h.amp_name, h.hospcode, h.hospname, h.hostype
)
SELECT
  district,
  hospcode,
  hospname,
  hostype,
  target_count,
  tested_count,
  controlled_count,
  ROUND(100.0 * controlled_count / NULLIF(target_count, 0), 2) AS performance_percent
FROM agg
ORDER BY district, hospcode
$sql$,
    'Target starts from diagnosis OPD/IPD E11.2-E11.4/E11.6-E11.8, assigned to active person type 1/3 discharge 9 by CID; latest valid LABFU 0531601 result in fiscal year 2569; controlled below 6.5.',
    NOW(),
    TRUE
  ),
  (
    6,
    'พัฒนาการเด็กปฐมวัย',
    'child_health',
    'child_health',
    NULL,
    ARRAY['person', 'procedure_opd', 'specialpp', 'diagnosis_opd'],
    $sql$
WITH child_population AS (
  SELECT hospcode, pid
  FROM person
  WHERE typearea IN ('1', '3')
    AND discharge = '9'
    AND birth BETWEEN '20201001' AND '20260930'
  GROUP BY hospcode, pid
),
service AS (
  SELECT hospcode, pid
  FROM procedure_opd
  WHERE date_serv BETWEEN '20251001' AND '20260930'
    AND REPLACE(UPPER(TRIM(procedcode)), '.', '') IN (
      '9433', '9374', '9375', '9381', '9382', '9383', '9384',
      '9005985', '9005986', '9005988', '9009601',
      '9009681', '9009684', '9009685', '9009686',
      '9349641', '9349642', '9349643', '9349647', '9349651',
      '9359645', '9359646', '9359647', '9409620', '9409699',
      '9429912', '9375811', '9375812', '9375813', '9375815',
      '9375816', '9375817', '9375818', '9375819', '9375820',
      '9375821', '9375822', '9375823', '9375824', '9375825',
      '9375826', '9375899', '9375915', '9379665', '9379666',
      '9995801', '9995810'
    )
  GROUP BY hospcode, pid

  UNION

  SELECT hospcode, pid
  FROM specialpp
  WHERE date_serv BETWEEN '20251001' AND '20260930'
    AND UPPER(TRIM(ppspecial)) IN ('1B270', '1B271', '1B272', '1B273', '1B274', '1B275')
  GROUP BY hospcode, pid

  UNION

  SELECT hospcode, pid
  FROM diagnosis_opd
  WHERE date_serv BETWEEN '20251001' AND '20260930'
    AND (
      REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'F7%'
      OR REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'F80%'
      OR REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'F82%'
      OR REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'F83%'
      OR REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'F84%'
      OR REPLACE(UPPER(TRIM(diagcode)), '.', '') LIKE 'G80%'
    )
  GROUP BY hospcode, pid
),
agg AS (
  SELECT
    h.amp_name AS district,
    h.hospcode,
    h.hospname,
    h.hostype,
    COUNT(DISTINCT c.pid) AS child_population_count,
    COUNT(DISTINCT s.pid) AS served_count
  FROM child_population c
  JOIN c_hospital h ON h.hospcode = c.hospcode
  LEFT JOIN service s ON s.hospcode = c.hospcode AND s.pid = c.pid
  WHERE h.is_active = TRUE
  GROUP BY h.amp_name, h.hospcode, h.hospname, h.hostype
)
SELECT
  district,
  hospcode,
  hospname,
  hostype,
  ROUND(child_population_count * 0.217, 0) AS target_count,
  served_count,
  ROUND(
    100.0 * served_count / NULLIF(ROUND(child_population_count * 0.217, 0), 0),
    2
  ) AS performance_percent
FROM agg
ORDER BY district, hospcode
$sql$,
    'Population type 1/3 aged 0-5y11m29d at 2026-09-30; estimated target is 21.7%; service codes follow the workbook.',
    NOW(),
    TRUE
  ),
  (
    7,
    'ความครอบคลุมวัคซีน MMR2',
    'vaccination',
    'vaccination',
    NULL,
    ARRAY['person', 'epi'],
    $sql$
WITH target AS (
  SELECT hospcode, pid
  FROM person
  WHERE typearea IN ('1', '3')
    AND discharge = '9'
    AND birth BETWEEN '20231001' AND '20260930'
  GROUP BY hospcode, pid
),
vaccinated AS (
  SELECT hospcode, pid
  FROM epi
  WHERE date_serv <= '20260930'
    AND vaccinetype = '073'
  GROUP BY hospcode, pid
),
agg AS (
  SELECT
    h.amp_name AS district,
    h.hospcode,
    h.hospname,
    h.hostype,
    COUNT(DISTINCT t.pid) AS target_count,
    COUNT(DISTINCT v.pid) AS vaccinated_count
  FROM target t
  JOIN c_hospital h ON h.hospcode = t.hospcode
  LEFT JOIN vaccinated v ON v.hospcode = t.hospcode AND v.pid = t.pid
  WHERE h.is_active = TRUE
  GROUP BY h.amp_name, h.hospcode, h.hospname, h.hostype
)
SELECT
  district,
  hospcode,
  hospname,
  hostype,
  target_count,
  vaccinated_count,
  ROUND(100.0 * vaccinated_count / NULLIF(target_count, 0), 2) AS performance_percent
FROM agg
ORDER BY district, hospcode
$sql$,
    'Population type 1/3 aged 0-2y11m29d at 2026-09-30; cumulative MMR2 code 073 through the cutoff date.',
    NOW(),
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  topic = EXCLUDED.topic,
  kpi_group = EXCLUDED.kpi_group,
  interval_minute = EXCLUDED.interval_minute,
  tables_use = EXCLUDED.tables_use,
  sql_command = EXCLUDED.sql_command,
  note = EXCLUDED.note,
  d_update = EXCLUDED.d_update,
  is_active = EXCLUDED.is_active;

SELECT setval(
  pg_get_serial_sequence('sql_for_sync_data', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM sql_for_sync_data), 1)
);
