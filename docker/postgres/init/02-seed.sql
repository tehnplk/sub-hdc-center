-- Seed data migrated from MySQL sub_hdc_center

INSERT INTO c_district (id, code, name) VALUES
  (1, '6501', 'เมืองพิษณุโลก'),
  (2, '6502', 'นครไทย'),
  (3, '6503', 'ชาติตระการ'),
  (4, '6504', 'บางระกำ'),
  (5, '6505', 'บางกระทุ่ม'),
  (6, '6506', 'พรหมพิราม'),
  (7, '6507', 'วัดโบสถ์'),
  (8, '6508', 'วังทอง'),
  (9, '6509', 'เนินมะปราง')
ON CONFLICT (code) DO NOTHING;

-- Values snapshot from production (mysql8) on 2026-07-06
INSERT INTO benchmark_district (id, district, system_on, hos_moph_all, hos_moph_send, hos_loc_all, hos_loc_send) VALUES
  (1, '6501', 1, 13, 0, 13, 0),
  (2, '6502', 1, 15, 9, 6, 1),
  (3, '6503', 1, 5, 0, 8, 0),
  (4, '6504', 1, 14, 0, 7, 0),
  (5, '6505', 0, 14, 0, 0, 0),
  (6, '6506', 1, 9, 0, 10, 0),
  (7, '6507', 1, 10, 0, 0, 0),
  (8, '6508', 1, 23, 0, 0, 0),
  (9, '6509', 1, 8, 0, 0, 0)
ON CONFLICT (district) DO NOTHING;

SELECT setval(pg_get_serial_sequence('c_district', 'id'), (SELECT MAX(id) FROM c_district));
SELECT setval(pg_get_serial_sequence('benchmark_district', 'id'), (SELECT MAX(id) FROM benchmark_district));
