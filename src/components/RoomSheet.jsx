import { useState } from 'react'
import { Icons } from './Icon'

const today = () => new Date().toISOString().split('T')[0]
const formatRp = (n) => 'Rp\u202f' + Number(n).toLocaleString('id-ID')

const STATUS_META = {
  SIAP_HUNI:   { label: 'Bersih',           dot: 'var(--clean)',    accent: 'var(--clean)' },
  TERISI:      { label: 'Terisi',            dot: 'var(--occupied)', accent: 'var(--occupied)' },
  PEMBERSIHAN: { label: 'Perlu Dibersihkan', dot: 'var(--dirty)',    accent: 'var(--dirty)' },
  DIPESAN:     { label: 'Dipesan',           dot: 'var(--reserved)', accent: 'var(--reserved)' },
  PERBAIKAN:   { label: 'Perbaikan',         dot: 'var(--maint)',    accent: 'var(--maint)' },
}

const TIER_OPTIONS = [
  { value: 'STANDAR', label: 'Standard', price: 150000 },
  { value: 'EKONOMI', label: 'Ekonomi',  price: 165000 },
  { value: 'DELUXE',  label: 'Deluxe',   price: 285000 },
]

function getTierLabel(kamar) {
  if (kamar.tipe_kamar) {
    const opt = TIER_OPTIONS.find(t => t.value === kamar.tipe_kamar)
    return opt ? opt.label : 'Standard'
  }
  const h = kamar.harga_per_malam
  if (!h) return 'Standard'
  if (h >= 250000) return 'Deluxe'
  if (h >= 200000) return 'Standard'
  return 'Ekonomi'
}

// Returns { value, unit } — shows hours when <=24h, days otherwise
function getCheckoutCountdown(tanggal_checkout) {
  if (!tanggal_checkout) return null
  const co = new Date(tanggal_checkout + 'T12:00:00')
  const diffMs = co - new Date()
  if (diffMs <= 0) return { value: 0, unit: 'j', label: 'Sudah lewat' }
  const totalHours = diffMs / (1000 * 60 * 60)
  if (totalHours <= 24) {
    return { value: Math.ceil(totalHours), unit: 'j', label: `${Math.ceil(totalHours)} jam lagi` }
  }
  const days = Math.ceil(totalHours / 24)
  return { value: days, unit: 'hr', label: `${days} hari lagi` }
}

function getMalamKe(tanggal_checkin) {
  if (!tanggal_checkin) return null
  const diff = Math.floor((new Date() - new Date(tanggal_checkin)) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

export default function RoomSheet({ kamar, cardRadius = 16, onCheckin, onCheckout, onCatatPembayaran, onBersih, onPerpanjang, onClose }) {
  const [step, setStep] = useState('detail') // 'detail' | 'checkin' | 'perpanjang'
  const [form, setForm] = useState({
    nama_tamu: '',
    asal: '',
    harga_per_malam: 150000,
    tipe_kamar: 'STANDAR',
    tanggal_checkin: today(),
    tanggal_checkout: '',
  })
  const [extraNights, setExtraNights] = useState(1)

  const meta = STATUS_META[kamar.status] || STATUS_META.SIAP_HUNI
  const tierLabel = getTierLabel(kamar)

  const jumlahMalam = form.tanggal_checkout
    ? Math.max(0, (new Date(form.tanggal_checkout) - new Date(form.tanggal_checkin)) / 86400000)
    : 0
  const totalHarga = jumlahMalam * form.harga_per_malam

  const coCountdown = getCheckoutCountdown(kamar.tanggal_checkout)
  const malamKe = getMalamKe(kamar.tanggal_checkin)

  const handleCheckinSubmit = () => {
    if (!form.nama_tamu || !form.tanggal_checkout || jumlahMalam <= 0) {
      alert('Lengkapi semua data terlebih dahulu.')
      return
    }
    onCheckin({ ...form, jumlah_malam: jumlahMalam, total_harga: totalHarga })
  }

  const handlePerpanjang = () => {
    if (extraNights <= 0) return
    if (onPerpanjang) {
      onPerpanjang(kamar, extraNights)
    }
  }

  const selectTier = (tier) => {
    setForm({ ...form, tipe_kamar: tier.value, harga_per_malam: tier.price })
  }

  return (
    <div className="wp-sheet-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wp-sheet" onClick={e => e.stopPropagation()}>
        <div className="wp-sheet-handle" />

        {/* Header */}
        <div className="wp-sheet-header">
          <div className="wp-sheet-num" style={{ borderRadius: cardRadius }}>
            {kamar.nomor_kamar}
          </div>
          <div style={{ flex: 1 }}>
            <div className="wp-sheet-title">Kamar {kamar.nomor_kamar}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: 7, background: meta.dot, display: 'inline-block' }} />
              <span className="wp-sheet-subtitle">{meta.label} · {tierLabel}</span>
            </div>
          </div>
          <button className="wp-icon-btn" onClick={onClose} aria-label="tutup">
            <Icons.Plus size={18} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        {/* ── Detail view ── */}
        {step === 'detail' && (
          <>
            {kamar.status === 'TERISI' && (
              <div className="wp-sheet-body">
                <div className="wp-sheet-section">
                  <div className="wp-sheet-row">
                    <span>Tamu</span>
                    <strong>{kamar.nama_tamu}</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Asal</span>
                    <strong>{kamar.asal || '—'}</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Malam ke</span>
                    <strong>{malamKe} dari {kamar.jumlah_malam || '?'} malam</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Check-out dalam</span>
                    <strong style={{ color: coCountdown?.value <= 0 ? 'var(--terracotta)' : coCountdown?.value <= 1 && coCountdown?.unit === 'j' ? 'var(--terracotta)' : 'var(--ink)' }}>
                      {coCountdown ? coCountdown.label : '—'}
                    </strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Tarif / malam</span>
                    <strong>{formatRp(kamar.harga_per_malam)}</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Total tagihan</span>
                    <strong>{formatRp(kamar.total_harga)}</strong>
                  </div>
                </div>
              </div>
            )}

            {kamar.status === 'SIAP_HUNI' && (
              <div className="wp-sheet-body">
                <div style={{ color: 'var(--ink-soft)', fontSize: 14, paddingBottom: 12 }}>
                  Kamar siap untuk tamu baru.
                </div>
              </div>
            )}

            {kamar.status === 'PEMBERSIHAN' && (
              <div className="wp-sheet-body">
                <div style={{ color: 'var(--ink-soft)', fontSize: 14, paddingBottom: 12 }}>
                  Kamar menunggu pembersihan sebelum siap kembali.
                </div>
              </div>
            )}

            {kamar.status === 'DIPESAN' && (
              <div className="wp-sheet-body">
                <div style={{ color: 'var(--ink-soft)', fontSize: 14, paddingBottom: 12 }}>
                  Kamar sudah dipesan, menunggu tamu datang.
                </div>
              </div>
            )}

            {kamar.status === 'PERBAIKAN' && (
              <div className="wp-sheet-body">
                <div style={{ color: 'var(--ink-soft)', fontSize: 14, paddingBottom: 12 }}>
                  Kamar sedang dalam perbaikan / maintenance.
                </div>
              </div>
            )}

            <div className="wp-sheet-actions" style={{ flexDirection: 'column', gap: 8 }}>
              {kamar.status === 'SIAP_HUNI' && (
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Batal</button>
                  <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={() => setStep('checkin')}>
                    <Icons.Key size={15} /> Check-in
                  </button>
                </div>
              )}
              {kamar.status === 'TERISI' && (
                <>
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button className="wp-btn wp-btn-primary" style={{ flex: 1 }} onClick={() => setStep('perpanjang')}>
                      Perpanjang
                    </button>
                    <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onCatatPembayaran}>
                      Catat pembayaran
                    </button>
                  </div>
                  <button
                    className="wp-btn wp-btn-danger"
                    style={{ width: '100%', marginTop: 4 }}
                    onClick={() => setStep('confirmCheckout')}
                  >
                    <Icons.Door size={15} /> Check-out
                  </button>
                </>
              )}
              {kamar.status === 'PEMBERSIHAN' && (
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Batal</button>
                  <button className="wp-btn wp-btn-teal" style={{ flex: 2 }} onClick={onBersih}>
                    <Icons.Check size={15} /> Tandai Bersih
                  </button>
                </div>
              )}
              {kamar.status === 'DIPESAN' && (
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Batal</button>
                  <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={() => setStep('checkin')}>
                    <Icons.Key size={15} /> Check-in Sekarang
                  </button>
                </div>
              )}
              {kamar.status === 'PERBAIKAN' && (
                <button className="wp-btn wp-btn-ghost" style={{ width: '100%' }} onClick={onClose}>Tutup</button>
              )}
            </div>
          </>
        )}

        {/* ── Check-in form ── */}
        {step === 'checkin' && (
          <>
            <div className="wp-sheet-body">
              <div className="wp-form-group">
                <label className="wp-form-label">Nama Tamu</label>
                <input
                  className="wp-form-input"
                  placeholder="Nama lengkap tamu"
                  value={form.nama_tamu}
                  onChange={e => setForm({ ...form, nama_tamu: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="wp-form-group">
                <label className="wp-form-label">Asal</label>
                <input
                  className="wp-form-input"
                  placeholder="Kota asal tamu"
                  value={form.asal}
                  onChange={e => setForm({ ...form, asal: e.target.value })}
                />
              </div>

              {/* Tier selector */}
              <div className="wp-form-group">
                <label className="wp-form-label">Tipe Kamar</label>
                <div className="wp-tier-selector">
                  {TIER_OPTIONS.map(tier => (
                    <button
                      key={tier.value}
                      className="wp-tier-option"
                      data-active={form.tipe_kamar === tier.value}
                      onClick={() => selectTier(tier)}
                    >
                      <div className="wp-tier-name">{tier.label}</div>
                      <div className="wp-tier-price">{formatRp(tier.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wp-form-group">
                <label className="wp-form-label">Tanggal Check-in</label>
                <input
                  className="wp-form-input"
                  type="date"
                  value={form.tanggal_checkin}
                  onChange={e => setForm({ ...form, tanggal_checkin: e.target.value })}
                />
              </div>
              <div className="wp-form-group">
                <label className="wp-form-label">Tanggal Check-out</label>
                <input
                  className="wp-form-input"
                  type="date"
                  value={form.tanggal_checkout}
                  onChange={e => setForm({ ...form, tanggal_checkout: e.target.value })}
                />
              </div>
              <div className="wp-kalkulasi">
                <div className="wp-kalkulasi-row">
                  <span>Jumlah malam</span>
                  <span>{jumlahMalam} malam</span>
                </div>
                <div className="wp-kalkulasi-row">
                  <span>Harga per malam</span>
                  <span>{formatRp(form.harga_per_malam)}</span>
                </div>
                <div className="wp-kalkulasi-total">
                  <span>Total</span>
                  <span>{formatRp(totalHarga)}</span>
                </div>
              </div>
            </div>
            <div className="wp-sheet-actions">
              <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={() => setStep('detail')}>
                ← Kembali
              </button>
              <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={handleCheckinSubmit}>
                Konfirmasi Check-in
              </button>
            </div>
          </>
        )}

        {/* ── Perpanjang form ── */}
        {step === 'perpanjang' && (
          <>
            <div className="wp-sheet-body">
              <div className="wp-sheet-section">
                <div className="wp-sheet-row">
                  <span>Tamu</span>
                  <strong>{kamar.nama_tamu}</strong>
                </div>
                <div className="wp-sheet-row">
                  <span>Tarif / malam</span>
                  <strong>{formatRp(kamar.harga_per_malam)}</strong>
                </div>
              </div>
              <div className="wp-form-group" style={{ marginTop: 16 }}>
                <label className="wp-form-label">Tambah Malam</label>
                <input
                  className="wp-form-input"
                  type="number"
                  min="1"
                  value={extraNights}
                  onChange={e => setExtraNights(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div className="wp-kalkulasi">
                <div className="wp-kalkulasi-row">
                  <span>Tambahan</span>
                  <span>{extraNights} malam</span>
                </div>
                <div className="wp-kalkulasi-total">
                  <span>Biaya perpanjangan</span>
                  <span>{formatRp(extraNights * (kamar.harga_per_malam || 150000))}</span>
                </div>
              </div>
            </div>
            <div className="wp-sheet-actions">
              <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={() => setStep('detail')}>
                ← Kembali
              </button>
              <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={handlePerpanjang}>
                Konfirmasi Perpanjang
              </button>
            </div>
          </>
        )}

        {/* ── Confirm Check-out ── */}
        {step === 'confirmCheckout' && (
          <>
            <div className="wp-sheet-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <Icons.Door size={40} style={{ color: 'var(--terracotta)', marginBottom: 16 }} />
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8, color: 'var(--ink)' }}>
                Check-out {kamar.nama_tamu}?
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                Kamar {kamar.nomor_kamar} akan dipindahkan ke antrian pembersihan.
                Transaksi {formatRp(kamar.total_harga)} akan dicatat.
              </div>
            </div>
            <div className="wp-sheet-actions">
              <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={() => setStep('detail')}>
                Batal
              </button>
              <button className="wp-btn wp-btn-danger" style={{ flex: 2 }} onClick={onCheckout}>
                Ya, Check-out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
