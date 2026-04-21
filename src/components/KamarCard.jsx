import { Icons } from './Icon'
import { formatKamarName, getOccupancyLabel, getCheckoutCountdownShort, getCheckinCountdownShort, getMalamKe, fmtRupiahK } from '../lib/utils'
const STATUS_MAP = {
  SIAP_HUNI:   { accent: 'var(--clean)',    bg: 'var(--clean-bg)',    fg: 'var(--clean-fg)',    status: 'vacant_clean', label: 'Bersih' },
  TERISI:      { accent: 'var(--occupied)', bg: 'var(--occupied-bg)', fg: 'var(--occupied-fg)', status: 'occupied',     label: 'Terisi' },
  PEMBERSIHAN: { accent: 'var(--dirty)',    bg: 'var(--dirty-bg)',    fg: 'var(--dirty-fg)',    status: 'vacant_dirty', label: 'Kotor' },
  DIPESAN:     { accent: 'var(--reserved)', bg: 'var(--reserved-bg)', fg: 'var(--reserved-fg)', status: 'reserved',    label: 'Dipesan' },
  PERBAIKAN:   { accent: 'var(--maint)',    bg: 'var(--maint-bg)',    fg: 'var(--maint-fg)',    status: 'maintenance', label: 'Perbaikan' },
}

export default function KamarCard({ kamar, showNumbers = true, cardRadius = 16, onClick }) {
  const cfg = STATUS_MAP[kamar.status] || STATUS_MAP.SIAP_HUNI
  const tier = kamar.occupancy ? (kamar.occupancy.charAt(0).toUpperCase() + kamar.occupancy.slice(1).toLowerCase()) : getOccupancyLabel(kamar.harga_per_malam, kamar.harga_per_malam)
  const coCountdown = getCheckoutCountdownShort(kamar.tanggal_checkout)
  const ciCountdown = getCheckinCountdownShort(kamar.tanggal_checkin)
  const malamKe = getMalamKe(kamar.tanggal_checkin)
  const isUrgent = coCountdown?.urgent ?? false

  const kName = formatKamarName(kamar.nomor_kamar)

  return (
    <button
      className="wp-room"
      style={{ borderRadius: cardRadius, '--room-accent': cfg.accent, '--room-bg': cfg.bg }}
      data-status={cfg.status}
      onClick={onClick}
    >
      <div className="wp-room-stripe" />

      <div className="wp-room-top">
        {showNumbers && <div className="wp-room-num" style={{ fontSize: kName.length > 7 ? 16 : 24, alignSelf: 'center', lineHeight: 1.1 }}>{kName}</div>}
        <div className="wp-room-dot" />
      </div>

      <div className="wp-room-body">
        {kamar.status === 'SIAP_HUNI' && (
          <>
            <div className="wp-room-name" style={{ color: 'var(--ink-soft)' }}>Siap huni</div>
          </>
        )}
        {kamar.status === 'TERISI' && (
          <>
            <div className="wp-room-name">{kamar.nama_tamu}</div>
            <div className="wp-room-sub">
              {kamar.no_telepon || '—'} · malam ke-{malamKe}
            </div>
          </>
        )}
        {kamar.status === 'PEMBERSIHAN' && (
          <>
            <div className="wp-room-name" style={{ color: 'var(--dirty-fg)' }}>Tunggu bersih</div>
            <div className="wp-room-sub">antrean cleaning</div>
          </>
        )}
        {kamar.status === 'DIPESAN' && (
          <>
            <div className="wp-room-name" style={{ color: 'var(--reserved-fg)' }}>{kamar.nama_tamu || 'Dipesan'}</div>
            <div className="wp-room-sub">menunggu kedatangan</div>
          </>
        )}
        {kamar.status === 'PERBAIKAN' && (
          <>
            <div className="wp-room-name" style={{ color: 'var(--maint-fg)' }}>Perbaikan</div>
            <div className="wp-room-sub">maintenance</div>
          </>
        )}
      </div>

      <div className="wp-room-foot">
        <span className="wp-room-tier">{tier}</span>
        {kamar.status === 'TERISI' && kamar.total_harga ? (
          <span className="wp-room-rate">{fmtRupiahK(kamar.total_harga)}</span>
        ) : kamar.harga_per_malam ? (
          <span className="wp-room-rate">{fmtRupiahK(kamar.harga_per_malam)}</span>
        ) : null}
      </div>

      {/* Checkout countdown ribbon */}
      {kamar.status === 'TERISI' && coCountdown && (
        <div className="wp-room-ribbon" data-urgent={isUrgent}>
          <Icons.Clock size={10} />
          {coCountdown.label}
        </div>
      )}

      {/* Checkin countdown ribbon */}
      {kamar.status === 'DIPESAN' && ciCountdown && (
        <div className="wp-room-ribbon" data-urgent={ciCountdown.urgent}>
          <Icons.Clock size={10} />
          {ciCountdown.label}
        </div>
      )}
    </button>
  )
}
