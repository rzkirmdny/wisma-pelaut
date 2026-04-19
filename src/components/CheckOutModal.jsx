const formatRp = (n) => 'Rp\u202f' + Number(n).toLocaleString('id-ID')

export default function CheckOutModal({ kamar, onConfirm, onCancel }) {
  return (
    <div className="wp-sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="wp-sheet">
        <div className="wp-sheet-handle" />

        <div className="wp-sheet-header">
          <div className="wp-sheet-num-badge">{kamar.nomor_kamar}</div>
          <div>
            <div className="wp-sheet-title">Check-out</div>
            <div className="wp-sheet-subtitle">{kamar.nama_tamu}</div>
          </div>
        </div>

        <div className="wp-sheet-body">
          <div className="wp-sheet-row">
            <span>Nama Tamu</span>
            <strong>{kamar.nama_tamu}</strong>
          </div>
          <div className="wp-sheet-row">
            <span>Check-in</span>
            <strong>{kamar.tanggal_checkin}</strong>
          </div>
          <div className="wp-sheet-row">
            <span>Check-out</span>
            <strong>{kamar.tanggal_checkout}</strong>
          </div>
          <div className="wp-sheet-row">
            <span>Jumlah Malam</span>
            <strong>{kamar.jumlah_malam} malam</strong>
          </div>
        </div>

        <div className="wp-sheet-total">
          <div className="wp-sheet-total-label">Total Tagihan</div>
          <div className="wp-sheet-total-val">{formatRp(kamar.total_harga)}</div>
        </div>

        <div className="wp-sheet-actions">
          <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Batal</button>
          <button className="wp-btn wp-btn-danger" style={{ flex: 2 }} onClick={onConfirm}>Konfirmasi Check-out</button>
        </div>
      </div>
    </div>
  )
}
