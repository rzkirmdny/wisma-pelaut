import { describe, it, expect } from 'vitest'
import {
  formatKamarName,
  formatKamarAbbr,
  getOccupancyOptions,
  getOccupancyLabel,
  formatRp,
  fmtRupiahK,
  calcNights,
} from '../lib/utils'

// ── formatKamarName ─────────────────────────────────────────────────────────
describe('formatKamarName', () => {
  it('maps Bawah 1-8 correctly', () => {
    expect(formatKamarName(1)).toBe('Bawah 1')
    expect(formatKamarName(5)).toBe('Bawah 5')
    expect(formatKamarName(8)).toBe('Bawah 8')
  })

  it('maps Gudang (9)', () => {
    expect(formatKamarName(9)).toBe('Gudang')
  })

  it('maps Atas 1-8 from nomor 11-18', () => {
    expect(formatKamarName(11)).toBe('Atas 1')
    expect(formatKamarName(18)).toBe('Atas 8')
  })

  it('maps Rizky Kecil (19)', () => {
    expect(formatKamarName(19)).toBe('Rizky Kecil')
  })

  it('maps Atas 10-12 from nomor 20-22', () => {
    expect(formatKamarName(20)).toBe('Atas 10')
    expect(formatKamarName(21)).toBe('Atas 11')
    expect(formatKamarName(22)).toBe('Atas 12')
  })

  it('maps Rizky Besar (23)', () => {
    expect(formatKamarName(23)).toBe('Rizky Besar')
  })

  it('falls back to string for unknown numbers', () => {
    expect(formatKamarName(99)).toBe('99')
  })

  it('handles string input', () => {
    expect(formatKamarName('6')).toBe('Bawah 6')
  })
})

// ── formatKamarAbbr ─────────────────────────────────────────────────────────
describe('formatKamarAbbr', () => {
  it('abbreviates Bawah rooms as B1-B8', () => {
    expect(formatKamarAbbr(1)).toBe('B1')
    expect(formatKamarAbbr(8)).toBe('B8')
  })

  it('abbreviates Gudang as GD', () => {
    expect(formatKamarAbbr(9)).toBe('GD')
  })

  it('abbreviates Atas rooms as A1-A8', () => {
    expect(formatKamarAbbr(11)).toBe('A1')
    expect(formatKamarAbbr(18)).toBe('A8')
  })

  it('abbreviates Rizky Kecil as RK', () => {
    expect(formatKamarAbbr(19)).toBe('RK')
  })

  it('abbreviates Rizky Besar as RB', () => {
    expect(formatKamarAbbr(23)).toBe('RB')
  })
})

// ── getOccupancyOptions ─────────────────────────────────────────────────────
describe('getOccupancyOptions', () => {
  it('returns Single/Double/Triple with +0/+20k/+40k for 160k base', () => {
    const opts = getOccupancyOptions(160000)
    expect(opts).toHaveLength(3)
    expect(opts[0]).toMatchObject({ value: 'SINGLE', price: 160000 })
    expect(opts[1]).toMatchObject({ value: 'DOUBLE', price: 180000 })
    expect(opts[2]).toMatchObject({ value: 'TRIPLE', price: 200000 })
  })

  it('returns correct prices for 180k base rooms', () => {
    const opts = getOccupancyOptions(180000)
    expect(opts[0].price).toBe(180000)
    expect(opts[1].price).toBe(200000)
    expect(opts[2].price).toBe(220000)
  })

  it('returns correct prices for 100k base (Bawah 6 kipas)', () => {
    const opts = getOccupancyOptions(100000)
    expect(opts[0].price).toBe(100000)
    expect(opts[1].price).toBe(120000)
    expect(opts[2].price).toBe(140000)
  })

  it('defaults to 160k when no base provided', () => {
    const opts = getOccupancyOptions(undefined)
    expect(opts[0].price).toBe(160000)
  })
})

// ── getOccupancyLabel ───────────────────────────────────────────────────────
describe('getOccupancyLabel', () => {
  it('returns Single when harga equals base', () => {
    expect(getOccupancyLabel(160000, 160000)).toBe('Single')
  })

  it('returns Double when harga is base + 20k', () => {
    expect(getOccupancyLabel(180000, 160000)).toBe('Double')
  })

  it('returns Triple when harga is base + 40k', () => {
    expect(getOccupancyLabel(200000, 160000)).toBe('Triple')
  })

  it('returns Single when harga is less than base', () => {
    expect(getOccupancyLabel(100000, 160000)).toBe('Single')
  })
})

// ── formatRp ────────────────────────────────────────────────────────────────
describe('formatRp', () => {
  it('formats with Rp prefix and Indonesian locale', () => {
    expect(formatRp(160000)).toMatch(/Rp/)
    expect(formatRp(160000)).toMatch(/160/)
  })

  it('handles zero and null', () => {
    expect(formatRp(0)).toMatch(/Rp/)
    expect(formatRp(null)).toMatch(/Rp/)
  })
})

// ── fmtRupiahK ──────────────────────────────────────────────────────────────
describe('fmtRupiahK', () => {
  it('formats millions as jt', () => {
    expect(fmtRupiahK(1500000)).toBe('1.5jt')
    expect(fmtRupiahK(2000000)).toBe('2jt')
  })

  it('formats thousands as rb', () => {
    expect(fmtRupiahK(160000)).toBe('160rb')
    expect(fmtRupiahK(1000)).toBe('1rb')
  })

  it('returns raw string for small values', () => {
    expect(fmtRupiahK(500)).toBe('500')
  })
})

// ── calcNights ──────────────────────────────────────────────────────────────
describe('calcNights', () => {
  it('calculates correct night count', () => {
    expect(calcNights('2026-04-20', '2026-04-23')).toBe(3)
  })

  it('returns 0 when checkout before checkin', () => {
    expect(calcNights('2026-04-25', '2026-04-20')).toBe(0)
  })

  it('returns 0 when same day', () => {
    expect(calcNights('2026-04-20', '2026-04-20')).toBe(0)
  })

  it('returns 0 when missing dates', () => {
    expect(calcNights('2026-04-20', '')).toBe(0)
    expect(calcNights('', '2026-04-20')).toBe(0)
    expect(calcNights(null, null)).toBe(0)
  })

  it('calculates single night stay', () => {
    expect(calcNights('2026-04-20', '2026-04-21')).toBe(1)
  })

  it('calculates long stay', () => {
    expect(calcNights('2026-04-01', '2026-04-30')).toBe(29)
  })
})
