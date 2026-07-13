// ตัวช่วย format ที่ใช้ร่วมทุกหน้า /rapid

export function formatNumber(value: number | undefined | null) {
  return Number(value || 0).toLocaleString('th-TH');
}

export function formatPercent(value: number | undefined | null) {
  return `${Number(value || 0).toFixed(2)}%`;
}

// ย่อชื่อสังกัดให้สั้น
export function formatAffiliation(value: string | undefined | null) {
  const affiliation = String(value || '').trim();
  if (affiliation === 'สป.สธ.') return 'สธ';
  if (affiliation === 'อปท.') return 'อปท';
  return affiliation || '-';
}

export function formatDate(value: string | undefined | null) {
  if (!value) return '…';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}
