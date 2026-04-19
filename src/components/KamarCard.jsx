import { Icons } from './Icon'

const fmtRupiahK = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt'
  if (n >= 1000) return Math.round(n / 1000) + 'rb'
  return String(n)
}

const STATUS_MAP = {
  SIAP_HUNI:   { accent: 'var(--clean)',    bg: 'var(--clean-bg)',    fg: 'var(--clean-fg)',    status: 'vacant_clean', label: 'Bersih' },
  TERISI:      { accent: 'var(--occupied)', bg: 'var(--occupied-bg)', fg: 'var(--occupied-fg)', status: 'occupied',     label: 'Terisi' },
  PEMBERSIHAN: { accent: 'var(--dirty)',    bg: 'var(--dirty-bg)',    fg: 'var(--dirty-fg)',    status: 'vacant_dirty', label: 'Kotor' },
  DIPESAN:     { accent: 'var(--reserved)', bg: 'var(--reserved-bg)', fg: 'var(--reserved-fg)', status: 'reserved',    label: 'Dipesan' },
  PERBAIKAN:   { accent: 'var(--maint)',    bg: 'var(--maint-bg)',    fg: 'var(--maint-fg)',    status: 'maintenance', label: 'Perbaikan' },
}

const TIER_LABELS = { EKONOMI: 'Ekonomi', STANDAR: 'Standar', DELUXE: 'Deluxe' }

function getTier(kamar) {
  if (kamar.tipe_kamar && TIER_LABELS[kamar.tipe_kamar]) return TIER_LABELS[kamar.tipe_kamar]
  const harga = kamar.harga_per_malam
  if (!harga) return 'Standar'
  if (harga >= 250000) return 'Deluxe'
  if (harga >= 200000) return 'Standar'
  return 'Ekonomi'
}

function getCheckoutCountdown(tanggal_checkout) {
  if (!tanggal_checkout) return null
  const co = new Date(tanggal_checkout + 'T12:00:00')
  const diffMs = co - new Date()
  if (diffMs <= 0) return { label: '✓ CO', urgent: true }
  const totalHours = diffMs / (1000 * 60 * 60)
  if (totalHours <= 24) {
    const h = Math.ceil(totalHours)
    return { label: `${h}j`, urgent: h <= 3 }
  }
  const days = Math.ceil(totalHours / 24)
  return { label: `${days}hr`, urgent: false }
}

function getMalamKe(tanggal_checkin) {
  if (!tanggal_checkin) return null
  const ci = new Date(tanggal_checkin)
  const now = new Date()
  const diff = Math.floor((now - ci) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

export default function KamarCard({ kamar, showNumbers = true, cardRadius = 16, onClick }) {
  const cfg = STATUS_MAP[kamar.status] || STATUS_MAP.SIAP_HUNI
  const tier = getTier(kamar)
  const coCountdown = getCheckoutCountdown(kamar.tanggal_checkout)
  const malamKe = getMalamKe(kamar.tanggal_checkin)
  const isUrgent = coCountdown?.urgent ?? false

  return (
    <button
      className="wp-room"
      style={{ borderRadius: cardRadius, '--room-accent': cfg.accent, '--room-bg': cfg.bg }}
      data-status={cfg.status}
      onClick={onClick}
    >
      <div className="wp-room-stripe" />

      <div className="wp-room-top">
        {showNumbers && <div className="wp-room-num">{kamar.nomor_kamar}</div>}
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
              {kamar.asal || '—'} · malam ke-{malamKe}
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
            <div className="wp-room-name" style={{ color: 'var(--reserved-fg)' }}>Dipesan</div>
            <div className="wp-room-sub">{kamar.nama_tamu || 'menunggu konfirmasi'}</div>
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
    </button>
  )
}
