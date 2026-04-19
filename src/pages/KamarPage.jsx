import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import KamarCard from '../components/KamarCard'
import RoomSheet from '../components/RoomSheet'
import { Icons } from '../components/Icon'

const STATUS_ORDER = ['occupied', 'vacant_clean', 'vacant_dirty', 'reserved', 'maintenance']

const STATUS_META = {
  SIAP_HUNI:   { key: 'vacant_clean', short: 'Bersih',      dot: 'var(--clean)' },
  TERISI:      { key: 'occupied',     short: 'Terisi',       dot: 'var(--occupied)' },
  PEMBERSIHAN: { key: 'vacant_dirty', short: 'Kotor',        dot: 'var(--dirty)' },
  DIPESAN:     { key: 'reserved',     short: 'Dipesan',      dot: 'var(--reserved)' },
  PERBAIKAN:   { key: 'maintenance',  short: 'Perbaikan',    dot: 'var(--maint)' },
}

const ROMAN = ['I', 'II', 'III']

function getFloor(nomor) {
  const n = Number(nomor)
  if (n >= 100) return Math.floor(n / 100)
  if (n <= 10)  return 1
  if (n <= 20)  return 2
  return 3
}

function numToWords(n) {
  const w = ['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh']
  if (n <= 10) return w[n]
  return String(n)
}

export default function KamarPage({ tweaks = {} }) {
  const { showRoomNumbers = true, cardRadius = 16 } = tweaks

  const [kamarList, setKamarList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [query, setQuery]         = useState('')
  const [selected, setSelected]   = useState(null)

  const fetchKamar = async () => {
    const { data } = await supabase.from('kamar').select('*').order('nomor_kamar')
    setKamarList(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchKamar() }, [])

  const handleCheckin = async (formData) => {
    const { error } = await supabase.from('kamar').update({
      status: 'TERISI',
      nama_tamu: formData.nama_tamu,
      tanggal_checkin: formData.tanggal_checkin,
      tanggal_checkout: formData.tanggal_checkout,
      jumlah_malam: formData.jumlah_malam,
      harga_per_malam: formData.harga_per_malam,
      total_harga: formData.total_harga,
    }).eq('id', selected.id)
    if (error) { alert('Gagal check-in: ' + error.message); return }
    setSelected(null); fetchKamar()
  }

  const handleCheckout = async () => {
    // Record to transaksi
    const { error: txError } = await supabase.from('transaksi').insert({
      nomor_kamar: selected.nomor_kamar,
      nama_tamu: selected.nama_tamu,
      tanggal_checkin: selected.tanggal_checkin,
      tanggal_checkout: selected.tanggal_checkout,
      jumlah_malam: selected.jumlah_malam,
      harga_per_malam: selected.harga_per_malam,
      total_harga: selected.total_harga,
    })
    if (txError) { alert('Gagal mencatat transaksi: ' + txError.message); return }

    // Move room to PEMBERSIHAN — only update columns that definitely exist
    const { error: upError } = await supabase.from('kamar').update({
      status: 'PEMBERSIHAN',
      nama_tamu: null,
      tanggal_checkin: null,
      tanggal_checkout: null,
      jumlah_malam: null,
      harga_per_malam: null,
      total_harga: null,
    }).eq('id', selected.id)
    if (upError) { alert('Gagal update status kamar: ' + upError.message); return }

    setSelected(null)
    fetchKamar()
  }

  // Catat pembayaran = record payment, room stays TERISI
  const handleCatatPembayaran = async () => {
    const { error } = await supabase.from('transaksi').insert({
      nomor_kamar: selected.nomor_kamar,
      nama_tamu: selected.nama_tamu,
      tanggal_checkin: selected.tanggal_checkin,
      tanggal_checkout: selected.tanggal_checkout,
      jumlah_malam: selected.jumlah_malam,
      harga_per_malam: selected.harga_per_malam,
      total_harga: selected.total_harga,
    })
    if (error) { alert('Gagal mencatat pembayaran: ' + error.message); return }
    setSelected(null)
    alert(`Pembayaran ${selected.nama_tamu} berhasil dicatat. Kamar masih aktif.`)
  }

  const handleBersih = async () => {
    await supabase.from('kamar').update({ status: 'SIAP_HUNI' }).eq('id', selected.id)
    setSelected(null); fetchKamar()
  }

  const handlePerpanjang = async (kamar, extraNights) => {
    const newCheckout = new Date(kamar.tanggal_checkout)
    newCheckout.setDate(newCheckout.getDate() + extraNights)
    const newCheckoutStr = newCheckout.toISOString().split('T')[0]
    const newMalam = (kamar.jumlah_malam || 0) + extraNights
    const newTotal = newMalam * (kamar.harga_per_malam || 150000)

    // Record perpanjangan as transaksi
    const { error: txErr } = await supabase.from('transaksi').insert({
      nomor_kamar: kamar.nomor_kamar,
      nama_tamu: kamar.nama_tamu,
      tanggal_checkin: kamar.tanggal_checkin,
      tanggal_checkout: newCheckoutStr,
      jumlah_malam: extraNights,
      harga_per_malam: kamar.harga_per_malam,
      total_harga: extraNights * (kamar.harga_per_malam || 150000),
    })
    if (txErr) { alert('Gagal mencatat perpanjangan: ' + txErr.message); return }

    const { error: upErr } = await supabase.from('kamar').update({
      tanggal_checkout: newCheckoutStr,
      jumlah_malam: newMalam,
      total_harga: newTotal,
    }).eq('id', kamar.id)
    if (upErr) { alert('Gagal update kamar: ' + upErr.message); return }

    setSelected(null); fetchKamar()
  }

  // Filter + search
  const filtered = useMemo(() => {
    return kamarList.filter(k => {
      if (filter !== 'all' && STATUS_META[k.status]?.key !== filter) return false
      if (query) {
        const q = query.toLowerCase()
        if (!String(k.nomor_kamar).includes(q) && !(k.nama_tamu || '').toLowerCase().includes(q) && !(k.asal || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [kamarList, filter, query])

  // Group by floor
  const floors = useMemo(() => {
    const map = {}
    for (const k of filtered) {
      const f = getFloor(k.nomor_kamar)
      if (!map[f]) map[f] = []
      map[f].push(k)
    }
    return map
  }, [filtered])

  const floorKeys = Object.keys(floors).map(Number).sort()

  // Counts
  const total      = kamarList.length
  const counts     = { all: total }
  for (const k of kamarList) {
    const key = STATUS_META[k.status]?.key
    if (key) counts[key] = (counts[key] || 0) + 1
  }

  const occupied    = counts.occupied     || 0
  const cleanCnt    = counts.vacant_clean || 0
  const dirtyCnt    = counts.vacant_dirty || 0
  const reservedCnt = counts.reserved     || 0
  const maintCnt    = counts.maintenance  || 0

  // Checkout today count
  const todayStr = new Date().toISOString().split('T')[0]
  const checkoutToday = kamarList.filter(k => k.tanggal_checkout === todayStr).length

  const now     = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour    = now.getHours()
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  // Build smart lede text
  const ledeParts = [`${occupied} dari ${total} kamar terisi hari ini.`]
  if (checkoutToday > 0) ledeParts.push(`${numToWords(checkoutToday).charAt(0).toUpperCase() + numToWords(checkoutToday).slice(1)} tamu check-out sebelum tengah hari,`)
  if (dirtyCnt > 0) ledeParts.push(`${numToWords(dirtyCnt)} kamar menunggu dibersihkan.`)
  else if (cleanCnt === total) ledeParts.push('semua kamar siap huni.')

  if (loading) return <div className="wp-loading">Memuat data kamar…</div>

  const summaryCards = [
    { key: 'all',          label: 'Semua',      count: total,       dot: null,               icon: 'Grid' },
    { key: 'occupied',     label: 'Terisi',     count: occupied,    dot: 'var(--occupied)',   icon: 'Key' },
    { key: 'vacant_clean', label: 'Bersih',     count: cleanCnt,    dot: 'var(--clean)',      icon: 'Check' },
    { key: 'vacant_dirty', label: 'Kotor',      count: dirtyCnt,    dot: 'var(--dirty)',      icon: 'Broom' },
    { key: 'reserved',     label: 'Dipesan',    count: reservedCnt, dot: 'var(--reserved)',   icon: 'Calendar' },
    { key: 'maintenance',  label: 'Perbaikan',  count: maintCnt,    dot: 'var(--maint)',      icon: 'Dots' },
  ]

  return (
    <>
      <div className="wp-page">
        {/* Top bar */}
        <div className="wp-topbar">
          <div>
            <div className="wp-page-eyebrow">· {dateStr.toUpperCase()}</div>
            <div className="wp-page-title">{greeting}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="wp-icon-btn"><Icons.Search size={18} /></button>
            <button className="wp-icon-btn"><Icons.Bell size={18} /></button>
            <button className="wp-btn wp-btn-primary" onClick={() => {
              // Find first available room and open check-in
              const avail = kamarList.find(k => k.status === 'SIAP_HUNI')
              if (avail) setSelected(avail)
              else alert('Tidak ada kamar tersedia.')
            }}>
              + Check-in baru
            </button>
          </div>
        </div>

        {/* Lede */}
        <p className="wp-page-lede">
          {ledeParts.join(' ')}
        </p>

        {/* Status summary — 6 cards */}
        <div className="wp-summary-grid">
          {summaryCards.map(({ key, label, count, dot, icon }) => {
            const Ico = Icons[icon] || Icons.Dots
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const active = filter === key
            return (
              <button
                key={key}
                className="wp-summary-card"
                data-active={active}
                onClick={() => setFilter(filter === key ? 'all' : key)}
              >
                <div className="wp-summary-head">
                  <span className="wp-summary-eyebrow">
                    {dot && <span style={{ width: 7, height: 7, borderRadius: 7, background: dot, display: 'inline-block' }} />}
                    {label}
                  </span>
                  <Ico size={14} />
                </div>
                <div className="wp-summary-num">{count}</div>
                <div className="wp-summary-foot">
                  <span style={{ fontFamily: 'var(--mono)' }}>{pct}%</span>
                  {dot && (
                    <div className="wp-summary-bar">
                      <div className="wp-summary-bar-fill" style={{ width: `${pct}%`, '--bar-color': dot }} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Toolbar */}
        <div className="wp-toolbar">
          <div className="wp-search">
            <Icons.Search size={15} />
            <input
              placeholder="Cari no. kamar, nama tamu, atau asal…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} className="wp-search-clear">hapus</button>
            )}
          </div>
          <div className="wp-toolbar-meta">
            <span>{filtered.length}</span> kamar
            {filter !== 'all' && (
              <button className="wp-chip-dismiss" onClick={() => setFilter('all')}>
                {summaryCards.find(s => s.key === filter)?.label} ×
              </button>
            )}
          </div>
        </div>

        {/* Floors */}
        <div key={filter + query} className="kamar-grid-wrap">
          {floorKeys.length === 0 ? (
            <div className="wp-room-grid">
              <div className="wp-room-empty">Tidak ada kamar yang cocok.</div>
            </div>
          ) : (
            floorKeys.map(floor => (
              <section key={floor} className="wp-floor">
                <div className="wp-floor-header">
                  <div className="wp-floor-label">
                    <span className="wp-floor-roman">{ROMAN[floor - 1] || floor}</span>
                    <span>Lantai {floor}</span>
                  </div>
                  <div className="wp-floor-meta">{floors[floor].length} kamar</div>
                  <div className="wp-floor-rule" />
                </div>
                <div className="wp-room-grid">
                  {floors[floor].map(k => (
                    <KamarCard
                      key={k.id}
                      kamar={k}
                      showNumbers={showRoomNumbers}
                      cardRadius={cardRadius}
                      onClick={() => setSelected(k)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {selected && (
        <RoomSheet
          kamar={selected}
          cardRadius={cardRadius}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
          onCatatPembayaran={handleCatatPembayaran}
          onBersih={handleBersih}
          onPerpanjang={handlePerpanjang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
