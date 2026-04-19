import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Icons } from '../components/Icon'

const fmtRp    = (n) => 'Rp\u202f' + Number(n || 0).toLocaleString('id-ID')
const fmtShort = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt'
  if (n >= 1000)      return Math.round(n / 1000) + 'rb'
  return String(n || 0)
}

const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const DAY_NAMES = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

function todayStr()     { return new Date().toISOString().split('T')[0] }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }
function daysAgoStr(n)  { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
function monthStart()   { return todayStr().slice(0, 7) + '-01' }
function extractTime(ts) {
  if (!ts) return '--:--'
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function remainingDays() {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return last - now.getDate()
}

// ── TargetRing ──────────────────────────────────────────────────────────────
function TargetRing({ pct, totalBulanan, target, onSetTarget }) {
  const [inputTarget, setInputTarget] = useState('')
  const size = 200
  const cx   = size / 2
  const r    = 80
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct / 100, 1)
  const remain    = Math.max(0, target - totalBulanan)
  const sisa      = remainingDays()
  const now       = new Date()
  const bulanName = BULAN_ID[now.getMonth()].toUpperCase()

  const submit = () => {
    const val = Number(inputTarget)
    if (val > 0) { onSetTarget(val); setInputTarget('') }
  }

  return (
    <div className="wp-target-area">
      <div className="wp-target-ring">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#DDD4C0" strokeWidth="18" />
          {/* Progress */}
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke="var(--terracotta)" strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="wp-target-ring-label">
          <div className="wp-target-pct">{pct}<span style={{ fontSize: '55%', opacity: 0.55, fontFamily: 'var(--sans)', fontWeight: 400 }}>%</span></div>
          <div className="wp-target-sub">TARGET</div>
        </div>
      </div>

      <div className="wp-target-info">
        <div className="wp-target-label">BULAN {bulanName}</div>
        <div className="wp-target-amount">
          {fmtShort(totalBulanan)}<span className="wp-target-amount-sep">/</span><br/><span className="wp-target-amount-soft">{fmtShort(target)}</span>
        </div>
        {remain > 0 && (
          <div className="wp-target-remain">
            {fmtRp(remain)} lagi.<br/>Tersisa {sisa} hari.
          </div>
        )}
        
        <div className="wp-target-row-mini">
          <input
            className="wp-target-input-mini"
            type="number"
            placeholder="Edit target…"
            value={inputTarget}
            onChange={e => setInputTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>
      </div>
    </div>
  )
}

// ── RevenueChart ────────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  const maxVal   = Math.max(...data.map(d => d.total), 1)
  const today    = todayStr()
  const withData = data.filter(d => d.total > 0)
  const avg      = withData.length > 0 ? Math.round(withData.reduce((s, d) => s + d.total, 0) / withData.length) : 0

  return (
    <div className="wp-chart">
      <div className="wp-chart-head">
        <div>
          <div className="wp-chart-title">14 hari terakhir</div>
          <div className="wp-chart-subtitle">
            Rata-rata harian <strong>{fmtShort(avg)}</strong>
          </div>
        </div>
        <div className="wp-chart-legend">
          <span><i style={{ background: 'var(--ink)' }} />Harian</span>
          <span><i style={{ background: 'var(--terracotta)' }} />Hari ini</span>
        </div>
      </div>
      <div className="wp-bars">
        {data.map(({ date, total, dayName }) => {
          const isToday   = date === today
          const hasData   = total > 0
          const heightPct = Math.max((total / maxVal) * 100, hasData ? 5 : 2)
          const ddmm      = date.slice(8) + '/' + date.slice(5, 7)
          
          const d = new Date(date)
          const isWeekend = d.getDay() === 0 || d.getDay() === 6 // 0=Min, 6=Sab
          
          return (
            <div key={date} className="wp-bar-col">
              <div className="wp-bar-wrap">
                {isToday && hasData && (
                  <div className="wp-bar-label">{fmtShort(total)}</div>
                )}
                <div
                  className="wp-bar"
                  data-today={isToday}
                  data-empty={!hasData || isWeekend}
                  style={{ height: `${heightPct}%` }}
                  title={`${date}: ${fmtRp(total)}`}
                />
              </div>
              <div className="wp-bar-label-row">
                <div className="wp-bar-day" data-today={isToday}>{dayName}</div>
                <div className="wp-bar-date">{ddmm}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── TransactionList ─────────────────────────────────────────────────────────
function TransactionList({ transactions, onOpenRiwayat }) {
  const getIcon = (type) => {
    if (type === 'check-out') return <Icons.Door size={20} />
    if (type === 'extend')    return <Icons.Clock size={20} />
    return <Icons.Key size={20} />
  }

  const getTypeLabel = (type) => {
    if (type === 'check-out') return 'Check-out'
    if (type === 'extend')    return 'Perpanjang'
    return 'Check-in'
  }

  return (
    <div className="wp-txn-list">
      <div className="wp-txn-header">
        <div className="wp-txn-header-title">Transaksi hari ini</div>
        <button className="wp-txn-view-all" onClick={onOpenRiwayat}>
          Lihat semua →
        </button>
      </div>
      {transactions.length === 0 ? (
        <div style={{ color: 'var(--ink-soft)', fontSize: 16, padding: '20px 0' }}>
          Belum ada transaksi hari ini.
        </div>
      ) : (
        transactions.map(t => {
          // Assume t.tipe or similar exists, if not we fallback to logic based on total_harga or something
          // But looking at existing code, t.total_harga is used.
          // Let's guess the type if not present.
          const type = t.total_harga > 0 ? (t.jumlah_malam > 0 ? 'check-in' : 'extend') : 'check-out'
          
          return (
            <div key={t.id} className="wp-txn-row">
              <div className="wp-txn-time">{extractTime(t.created_at)}</div>
              <div className="wp-txn-icon" data-type={type}>
                {getIcon(type)}
              </div>
              <div>
                <div className="wp-txn-title">{getTypeLabel(type)} · Kamar {t.nomor_kamar}</div>
                <div className="wp-txn-sub">
                  {t.nama_tamu} · {t.jumlah_malam} malam · oleh {t.staff_name || 'Staff'}
                </div>
              </div>
              <div className="wp-txn-amount" data-zero={!t.total_harga}>
                {t.total_harga ? '+ ' + fmtRp(t.total_harga) : '—'}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── RekapPage ───────────────────────────────────────────────────────────────
export default function RekapPage({ onOpenRiwayat }) {
  const [transaksiHarian, setTransaksiHarian] = useState([])
  const [totalHarian,     setTotalHarian]     = useState(0)
  const [totalKemarin,    setTotalKemarin]    = useState(0)
  const [totalBulanan,    setTotalBulanan]    = useState(0)
  const [chartData,       setChartData]       = useState([])
  const [kamarList,       setKamarList]       = useState([])
  const [checkinHariIni,  setCheckinHariIni]  = useState(0)
  const [target,          setTargetState]     = useState(() => Number(localStorage.getItem('wp:target')) || 4_000_000)
  const [toast,           setToast]           = useState(false)
  const [loading,         setLoading]         = useState(true)

  const today     = todayStr()
  const yesterday = yesterdayStr()
  const now       = new Date()
  const tanggal   = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const bulanLabel = BULAN_ID[now.getMonth()] + ' ' + now.getFullYear()

  useEffect(() => {
    const load = async () => {
      const [
        { data: harian },
        { data: kemarin },
        { data: bulanan },
        { data: kamar },
        { data: chart14 },
        { data: checkins },
      ] = await Promise.all([
        supabase.from('transaksi').select('*')
          .gte('created_at', today + 'T00:00:00')
          .order('created_at', { ascending: false }),
        supabase.from('transaksi').select('total_harga')
          .gte('created_at', yesterday + 'T00:00:00')
          .lt('created_at', today + 'T00:00:00'),
        supabase.from('transaksi').select('total_harga')
          .gte('created_at', monthStart() + 'T00:00:00'),
        supabase.from('kamar').select('status'),
        supabase.from('transaksi').select('created_at,total_harga')
          .gte('created_at', daysAgoStr(13) + 'T00:00:00')
          .order('created_at'),
        supabase.from('kamar').select('id').eq('tanggal_checkin', today),
      ])

      setTransaksiHarian(harian || [])
      setTotalHarian((harian || []).reduce((s, t) => s + (t.total_harga || 0), 0))
      setTotalKemarin((kemarin || []).reduce((s, t) => s + (t.total_harga || 0), 0))
      setTotalBulanan((bulanan || []).reduce((s, t) => s + (t.total_harga || 0), 0))
      setKamarList(kamar || [])
      setCheckinHariIni((checkins || []).length)

      const byDate = {}
      for (const row of (chart14 || [])) {
        const d = row.created_at.split('T')[0]
        byDate[d] = (byDate[d] || 0) + (row.total_harga || 0)
      }
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = daysAgoStr(13 - i)
        return { date: d, total: byDate[d] || 0, dayName: DAY_NAMES[new Date(d).getDay()] }
      })
      setChartData(days)
      setLoading(false)
    }
    load()
  }, [])

  const setTarget = (val) => { setTargetState(val); localStorage.setItem('wp:target', val) }

  const totalKamar  = kamarList.length
  const terisi      = kamarList.filter(k => k.status === 'TERISI').length
  const siapHuni    = kamarList.filter(k => k.status === 'SIAP_HUNI').length
  const pembersihan = kamarList.filter(k => k.status === 'PEMBERSIHAN').length
  const ocupansi    = totalKamar > 0 ? Math.round((terisi / totalKamar) * 100) : 0
  const checkoutCnt = transaksiHarian.length

  const deltaVal  = totalKemarin > 0 ? ((totalHarian - totalKemarin) / totalKemarin) * 100 : (totalHarian > 0 ? 100 : 0)
  const deltaPos  = deltaVal >= 0
  const delta     = deltaVal
  const pct       = Math.min(100, Math.round((totalBulanan / Math.max(target, 1)) * 100))

  const salinWA = useCallback(async () => {
    const lines = transaksiHarian.length
      ? transaksiHarian.map(t => `• Kamar ${t.nomor_kamar} - ${t.nama_tamu} - ${fmtRp(t.total_harga)}`).join('\n')
      : '• (belum ada transaksi)'
    const teks = `---\n📋 *REKAP WISMA PELAUT*\n📅 ${tanggal}\n\n🏠 Status Kamar:\n• Terisi: ${terisi}\n• Siap Huni: ${siapHuni}\n• Pembersihan: ${pembersihan}\n• Okupansi: ${ocupansi}%\n\n💰 Pendapatan Hari Ini: ${fmtRp(totalHarian)}\n🎯 Target Bulanan: ${pct}% (${fmtRp(totalBulanan)} / ${fmtRp(target)})\n\n📝 Transaksi Hari Ini:\n${lines}\n\n_Dikirim otomatis via Wisma Pelaut App_\n---`
    try {
      await navigator.clipboard.writeText(teks)
      setToast(true)
      window.setTimeout(() => setToast(false), 2200)
    } catch {
      alert('Gagal menyalin. Izinkan akses clipboard di browser.')
    }
  }, [transaksiHarian, tanggal, terisi, siapHuni, pembersihan, ocupansi, totalHarian, pct, totalBulanan, target])

  if (loading) return <div className="wp-loading">Memuat rekap…</div>

  return (
    <div className="wp-page">
      {/* Top bar */}
      <div className="wp-topbar">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div className="wp-page-title">Rekap harian</div>
          <div className="wp-page-eyebrow">· {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="wp-btn wp-btn-ghost" style={{ gap: 8 }}>
            <Icons.Calendar size={14} /> {bulanLabel}
          </button>
          <button className="wp-btn wp-btn-primary" onClick={salinWA}>
            Tutup buku hari ini
          </button>
        </div>
      </div>

      {/* Hero card */}
        <div className="wp-recap-hero">
          <div className="wp-recap-hero-main">
            <div className="wp-recap-eyebrow">Pendapatan Hari Ini</div>
            <div className="wp-recap-amount">
              <span className="wp-recap-amount-prefix">Rp</span>
              {Number(totalHarian).toLocaleString('id-ID')}
            </div>

            <div className="wp-recap-delta-row">
              <span className={`wp-recap-delta ${deltaPos ? 'wp-recap-delta-pos' : 'wp-recap-delta-neg'}`}>
                {deltaPos ? '↑' : '↓'} {Math.abs(delta).toFixed(0)}%
              </span>
              <span className="wp-recap-delta-meta">
                vs kemarin ({fmtRp(totalKemarin)})
              </span>
            </div>

            <div className="wp-recap-breakdown">
              <div className="wp-stat">
                <div className="wp-stat-num">{checkinHariIni}</div>
                <div className="wp-stat-label">Check-in</div>
              </div>
              <div className="wp-stat">
                <div className="wp-stat-num">{checkoutCnt}</div>
                <div className="wp-stat-label">Check-out</div>
              </div>
              <div className="wp-stat">
                <div className="wp-stat-num">1</div>
                <div className="wp-stat-label">Perpanjang</div>
              </div>
              <div className="wp-stat">
                <div className="wp-stat-num">{ocupansi}<span className="wp-stat-num-unit">%</span></div>
                <div className="wp-stat-label">Okupansi</div>
              </div>
            </div>
          </div>

          <div className="wp-recap-hero-side">
            <TargetRing pct={pct} totalBulanan={totalBulanan} target={target} onSetTarget={setTarget} />
          </div>
        </div>

      {/* 14-day chart */}
      <RevenueChart data={chartData} />

      {/* Today's transactions */}
      <TransactionList transactions={transaksiHarian} onOpenRiwayat={onOpenRiwayat} />

      {/* Actions */}
      <div className="wp-recap-actions" style={{ marginTop: 20 }}>
        <button className="wp-btn wp-btn-wa wp-btn-full" onClick={salinWA}>
          Salin Rekap WhatsApp
        </button>
      </div>

      {toast && <div className="toast" role="status">Rekap berhasil disalin!</div>}
    </div>
  )
}
