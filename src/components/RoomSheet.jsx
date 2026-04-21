import { useState } from 'react'
import { Icons } from './Icon'
import { formatKamarName, formatKamarAbbr, getOccupancyOptions, getOccupancyLabel, getCheckoutCountdown, getCheckinCountdown, getMalamKe, calcNights } from '../lib/utils'

const todayStr = () => new Date().toISOString().split('T')[0]
const formatRp = (n) => 'Rp\u202f' + Number(n || 0).toLocaleString('id-ID')

const STATUS_META = {
  SIAP_HUNI:   { label: 'Bersih',           dot: 'var(--clean)',    accent: 'var(--clean)' },
  TERISI:      { label: 'Terisi',            dot: 'var(--occupied)', accent: 'var(--occupied)' },
  PEMBERSIHAN: { label: 'Perlu Dibersihkan', dot: 'var(--dirty)',    accent: 'var(--dirty)' },
  DIPESAN:     { label: 'Dipesan',           dot: 'var(--reserved)', accent: 'var(--reserved)' },
  PERBAIKAN:   { label: 'Perbaikan',         dot: 'var(--maint)',    accent: 'var(--maint)' },
}

export default function RoomSheet({ kamar, cardRadius = 16, onCheckin, onCheckout, onCatatPembayaran, onBersih, onPerpanjang, onPesan, onBatalPesan, onClose }) {
  const basePrice = kamar.harga_per_malam || 160000
  const occupancyOpts = getOccupancyOptions(basePrice)

  const [step, setStep] = useState('detail') // 'detail' | 'checkin' | 'perpanjang'
  const [form, setForm] = useState({
    nama_tamu: kamar.nama_tamu || '',
    no_telepon: kamar.no_telepon || '',
    harga_per_malam: kamar.harga_per_malam || basePrice,
    occupancy: 'SINGLE',
    tanggal_checkin: kamar.tanggal_checkin || todayStr(),
    tanggal_checkout: kamar.tanggal_checkout || '',
  })
  const [extraNights, setExtraNights] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')

  const meta = STATUS_META[kamar.status] || STATUS_META.SIAP_HUNI
  const occupancyLabel = getOccupancyLabel(kamar.harga_per_malam, basePrice)

  const jumlahMalam = calcNights(form.tanggal_checkin, form.tanggal_checkout)
  const totalHarga = jumlahMalam * form.harga_per_malam

  const coCountdown = getCheckoutCountdown(kamar.tanggal_checkout)
  const ciCountdown = getCheckinCountdown(kamar.tanggal_checkin)
  const malamKe = getMalamKe(kamar.tanggal_checkin)

  const handleCheckinSubmit = () => {
    setErrorMsg('')
    if (!form.nama_tamu || !form.tanggal_checkout || jumlahMalam <= 0) {
      setErrorMsg('Silakan lengkapi semua data terlebih dahulu.')
      return
    }
    if (!form.no_telepon || form.no_telepon.replace(/\D/g, '').length < 10) {
      setErrorMsg('Nomor Telepon harus valid (minimal 10 digit).')
      return
    }
    onCheckin({
      ...form,
      harga_per_malam: Number(form.harga_per_malam) || 0,
      jumlah_malam: jumlahMalam,
      total_harga: totalHarga || 0
    })
  }

  const handlePesanSubmit = () => {
    setErrorMsg('')
    if (!form.nama_tamu || !form.tanggal_checkin || !form.tanggal_checkout || jumlahMalam <= 0) {
      setErrorMsg('Silakan lengkapi semua data terlebih dahulu.')
      return
    }
    if (!form.no_telepon || form.no_telepon.replace(/\D/g, '').length < 10) {
      setErrorMsg('Nomor Telepon harus valid (minimal 10 digit).')
      return
    }
    onPesan({
      ...form,
      harga_per_malam: Number(form.harga_per_malam) || 0,
      jumlah_malam: jumlahMalam,
      total_harga: totalHarga || 0
    })
  }

  const handlePerpanjang = () => {
    if (extraNights <= 0) return
    if (onPerpanjang) onPerpanjang(kamar, extraNights)
  }

  const selectOccupancy = (opt) => {
    setForm({ ...form, occupancy: opt.value, harga_per_malam: opt.price })
  }

  const kName = formatKamarName(kamar.nomor_kamar)
  const kAbbr = formatKamarAbbr(kamar.nomor_kamar)

  return (
    <div className="wp-sheet-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wp-sheet" onClick={e => e.stopPropagation()}>
        <div className="wp-sheet-handle" />

        {/* Header */}
        <div className="wp-sheet-header">
          <div className="wp-sheet-num" style={{ borderRadius: cardRadius, fontSize: kAbbr.length > 2 ? 22 : 30 }}>
            {kAbbr}
          </div>
          <div style={{ flex: 1 }}>
            <div className="wp-sheet-title">{kName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: 7, background: meta.dot, display: 'inline-block' }} />
              <span className="wp-sheet-subtitle">{meta.label} · {occupancyLabel}</span>
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
                    <span>No. Telepon</span>
                    <strong>{kamar.no_telepon || '—'}</strong>
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
                <div className="wp-sheet-section">
                  <div className="wp-sheet-row">
                    <span>Pemesan</span>
                    <strong>{kamar.nama_tamu}</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>No. Telepon</span>
                    <strong>{kamar.no_telepon || '—'}</strong>
                  </div>
                  <div className="wp-sheet-row">
                    <span>Rencana Check-in</span>
                    <strong style={{ color: ciCountdown?.value <= 0 ? 'var(--terracotta)' : 'var(--ink)' }}>
                      {ciCountdown ? ciCountdown.label : '—'}
                    </strong>
                  </div>
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
                  <button className="wp-btn wp-btn-secondary" style={{ flex: 1 }} onClick={() => setStep('pesan')}>
                    <Icons.Calendar size={15} /> Pesan
                  </button>
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
                  <button className="wp-btn wp-btn-teal" style={{ flex: 1 }} onClick={onBersih}>
                    <Icons.Check size={15} /> Tandai Bersih
                  </button>
                </div>
              )}
              {kamar.status === 'DIPESAN' && (
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onBatalPesan}>Batalkan</button>
                  <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={() => setStep('checkin')}>
                    <Icons.Key size={15} /> Check-in Sekarang
                  </button>
                </div>
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
                <label className="wp-form-label">No. Telepon</label>
                <input
                  className="wp-form-input"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={form.no_telepon}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9+]/g, '');
                    setForm({ ...form, no_telepon: val })
                  }}
                />
              </div>

              {/* Occupancy selector */}
              <div className="wp-form-group">
                <label className="wp-form-label">Jumlah Orang</label>
                <div className="wp-tier-selector">
                  {occupancyOpts.map(opt => (
                    <button
                      key={opt.value}
                      className="wp-tier-option"
                      data-active={form.occupancy === opt.value}
                      onClick={() => selectOccupancy(opt)}
                    >
                      <div className="wp-tier-name">{opt.label}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{opt.sub}</div>
                      <div className="wp-tier-price">{formatRp(opt.price)}</div>
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
              <div className="wp-form-group">
                <label className="wp-form-label">Harga / Malam (Bisa diubah)</label>
                <input
                  className="wp-form-input"
                  type="text"
                  value={form.harga_per_malam === '' ? '' : Number(form.harga_per_malam).toLocaleString('id-ID')}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '')
                    setForm({ ...form, harga_per_malam: val === '' ? '' : Number(val) })
                  }}
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
              {errorMsg && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--terracotta)', borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icons.Plus size={14} style={{ transform: 'rotate(45deg)', flexShrink: 0 }} /> {errorMsg}
                </div>
              )}
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

        {/* ── Form Pesan ── */}
        {step === 'pesan' && (
          <>
            <div className="wp-sheet-body">
              <div className="wp-form-group">
                <label className="wp-form-label">Nama Pemesan</label>
                <input
                  className="wp-form-input"
                  placeholder="Nama pemesan"
                  value={form.nama_tamu}
                  onChange={e => setForm({ ...form, nama_tamu: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="wp-form-group">
                <label className="wp-form-label">No. Telepon</label>
                <input
                  className="wp-form-input"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={form.no_telepon}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9+]/g, '');
                    setForm({ ...form, no_telepon: val })
                  }}
                />
              </div>

              {/* Occupancy selector */}
              <div className="wp-form-group">
                <label className="wp-form-label">Jumlah Orang</label>
                <div className="wp-tier-selector">
                  {occupancyOpts.map(opt => (
                    <button
                      key={opt.value}
                      className="wp-tier-option"
                      data-active={form.occupancy === opt.value}
                      onClick={() => selectOccupancy(opt)}
                    >
                      <div className="wp-tier-name">{opt.label}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{opt.sub}</div>
                      <div className="wp-tier-price">{formatRp(opt.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wp-form-group">
                <label className="wp-form-label">Rencana Check-in</label>
                <input
                  className="wp-form-input"
                  type="date"
                  value={form.tanggal_checkin}
                  onChange={e => setForm({ ...form, tanggal_checkin: e.target.value })}
                />
              </div>
              <div className="wp-form-group">
                <label className="wp-form-label">Rencana Check-out</label>
                <input
                  className="wp-form-input"
                  type="date"
                  value={form.tanggal_checkout}
                  onChange={e => setForm({ ...form, tanggal_checkout: e.target.value })}
                />
              </div>
              <div className="wp-form-group">
                <label className="wp-form-label">Harga / Malam (Bisa diubah)</label>
                <input
                  className="wp-form-input"
                  type="text"
                  value={form.harga_per_malam === '' ? '' : Number(form.harga_per_malam).toLocaleString('id-ID')}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '')
                    setForm({ ...form, harga_per_malam: val === '' ? '' : Number(val) })
                  }}
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
              {errorMsg && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--terracotta)', borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icons.Plus size={14} style={{ transform: 'rotate(45deg)', flexShrink: 0 }} /> {errorMsg}
                </div>
              )}
            </div>
            <div className="wp-sheet-actions">
              <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={() => setStep('detail')}>
                ← Kembali
              </button>
              <button className="wp-btn wp-btn-secondary" style={{ flex: 2 }} onClick={handlePesanSubmit}>
                Konfirmasi Pesanan
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
                Kamar {kName} akan dipindahkan ke antrian pembersihan.
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
