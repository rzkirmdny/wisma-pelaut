import { useState } from 'react'

const today = () => new Date().toISOString().split('T')[0]

const formatRp = (n) => 'Rp\u202f' + Number(n).toLocaleString('id-ID')

export default function CheckInModal({ kamar, onConfirm, onCancel }) {
  const [form, setForm] = useState({
    nama_tamu: '',
    harga_per_malam: 150000,
    tanggal_checkin: today(),
    tanggal_checkout: '',
  })

  const jumlahMalam = form.tanggal_checkout
    ? Math.max(0, (new Date(form.tanggal_checkout) - new Date(form.tanggal_checkin)) / 86400000)
    : 0

  const totalHarga = jumlahMalam * form.harga_per_malam

  const handleSubmit = () => {
    if (!form.nama_tamu || !form.tanggal_checkout || jumlahMalam <= 0) {
      alert('Lengkapi semua data terlebih dahulu.')
      return
    }
    onConfirm({ ...form, jumlah_malam: jumlahMalam, total_harga: totalHarga })
  }

  return (
    <div className="wp-sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="wp-sheet">
        <div className="wp-sheet-handle" />

        <div className="wp-sheet-header">
          <div className="wp-sheet-num-badge">{kamar.nomor_kamar}</div>
          <div>
            <div className="wp-sheet-title">Check-in</div>
            <div className="wp-sheet-subtitle">Kamar {kamar.nomor_kamar}</div>
          </div>
        </div>

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
            <label className="wp-form-label">Harga per Malam</label>
            <input
              className="wp-form-input"
              type="number"
              value={form.harga_per_malam}
              onChange={e => setForm({ ...form, harga_per_malam: Number(e.target.value) })}
            />
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
          <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Batal</button>
          <button className="wp-btn wp-btn-primary" style={{ flex: 2 }} onClick={handleSubmit}>Konfirmasi Check-in</button>
        </div>
      </div>
    </div>
  )
}
