// ── Room Name Mapping ───────────────────────────────────────────────────────
export function formatKamarName(no) {
  const n = Number(no);
  if (n >= 1 && n <= 8) return `Bawah ${n}`;
  if (n === 9) return `Gudang`;
  if (n >= 11 && n <= 18) return `Atas ${n - 10}`;
  if (n === 19) return `Rizky Kecil`;
  if (n >= 20 && n <= 22) return `Atas ${n - 10}`;
  if (n === 23) return `Rizky Besar`;
  return String(n);
}

export function formatKamarAbbr(no) {
  const n = Number(no);
  if (n >= 1 && n <= 8) return `B${n}`;
  if (n === 9) return `GD`;
  if (n >= 11 && n <= 18) return `A${n - 10}`;
  if (n === 19) return `RK`;
  if (n >= 20 && n <= 22) return `A${n - 10}`;
  if (n === 23) return `RB`;
  return String(n);
}

// ── Occupancy-based Pricing ─────────────────────────────────────────────────
// Base 160k rooms: Single 160k, Double 180k, Triple 200k
// Base 180k rooms: Single 180k, Double 200k, Triple 220k
// Base 100k room (Bawah 6 — kipas): Single 100k, Double 120k, Triple 140k

export function getOccupancyOptions(basePrice) {
  const base = Number(basePrice) || 160000;
  return [
    { value: 'SINGLE', label: 'Single',  sub: '1 orang', price: base },
    { value: 'DOUBLE', label: 'Double',  sub: '2 orang', price: base + 20000 },
    { value: 'TRIPLE', label: 'Triple',  sub: '3 orang', price: base + 40000 },
  ];
}

export function getOccupancyLabel(harga, basePrice) {
  const base = Number(basePrice) || 160000;
  const h = Number(harga);
  if (h <= base) return 'Single';
  if (h <= base + 20000) return 'Double';
  return 'Triple';
}

// ── Currency Formatting ─────────────────────────────────────────────────────
export function formatRp(n) {
  return 'Rp\u202f' + Number(n || 0).toLocaleString('id-ID');
}

export function fmtRupiahK(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt';
  if (n >= 1000) return Math.round(n / 1000) + 'rb';
  return String(n);
}

// ── Date Utilities ──────────────────────────────────────────────────────────
export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getCheckoutCountdown(tanggal_checkout) {
  if (!tanggal_checkout) return null;
  const co = new Date(tanggal_checkout + 'T12:00:00');
  const diffMs = co - new Date();
  if (diffMs <= 0) return { value: 0, unit: 'j', label: 'Sudah lewat', urgent: true };
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours <= 24) {
    const h = Math.ceil(totalHours);
    return { value: h, unit: 'j', label: `${h} jam lagi`, urgent: h <= 3 };
  }
  const days = Math.ceil(totalHours / 24);
  return { value: days, unit: 'hr', label: `${days} hari lagi`, urgent: false };
}

export function getCheckoutCountdownShort(tanggal_checkout) {
  if (!tanggal_checkout) return null;
  const co = new Date(tanggal_checkout + 'T12:00:00');
  const diffMs = co - new Date();
  if (diffMs <= 0) return { label: '✓ CO', urgent: true };
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours <= 24) {
    const h = Math.ceil(totalHours);
    return { label: `${h}j`, urgent: h <= 3 };
  }
  const days = Math.ceil(totalHours / 24);
  return { label: `${days}hr`, urgent: false };
}

export function getMalamKe(tanggal_checkin) {
  if (!tanggal_checkin) return null;
  const diff = Math.floor((new Date() - new Date(tanggal_checkin)) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function calcNights(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  return Math.max(0, (new Date(checkout) - new Date(checkin)) / 86400000);
}

export function getCheckinCountdown(tanggal_checkin) {
  if (!tanggal_checkin) return null;
  const ci = new Date(tanggal_checkin + 'T14:00:00'); // Asumsi jam check-in standar 14:00
  const diffMs = ci - new Date();
  if (diffMs <= 0) return { value: 0, unit: 'j', label: 'Hari ini', urgent: true };
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours <= 24) {
    const h = Math.ceil(totalHours);
    return { value: h, unit: 'j', label: `dalam ${h} jam`, urgent: h <= 6 };
  }
  const days = Math.ceil(totalHours / 24);
  return { value: days, unit: 'hr', label: `dalam ${days} hari`, urgent: false };
}

export function getCheckinCountdownShort(tanggal_checkin) {
  if (!tanggal_checkin) return null;
  const ci = new Date(tanggal_checkin + 'T14:00:00');
  const diffMs = ci - new Date();
  if (diffMs <= 0) return { label: 'Hr ini', urgent: true };
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours <= 24) {
    const h = Math.ceil(totalHours);
    return { label: `${h}j lg`, urgent: h <= 6 };
  }
  const days = Math.ceil(totalHours / 24);
  return { label: `${days}h lg`, urgent: false };
}
