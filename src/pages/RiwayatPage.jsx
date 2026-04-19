import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Icons } from '../components/Icon'

const fmtRp = (n) => 'Rp\u202f' + Number(n || 0).toLocaleString('id-ID')
const pad2  = (n) => String(n).padStart(2, '0')

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function monthRange(year, month) {
  const start   = `${year}-${pad2(month)}-01T00:00:00`
  const lastDay = new Date(year, month, 0).getDate()
  const end     = `${year}-${pad2(month)}-${pad2(lastDay)}T23:59:59.999`
  return { start, end }
}

function extractTime(ts) {
  if (!ts) return '--:--'
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function extractDate(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function RiwayatPage({ onBack }) {
  const [year,    setYear]    = useState(() => new Date().getFullYear())
  const [month,   setMonth]   = useState(() => new Date().getMonth() + 1)
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)

  const { start, end } = useMemo(() => monthRange(year, month), [year, month])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('transaksi').select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [start, end])

  const total = list.reduce((s, t) => s + Number(t.total_harga || 0), 0)
  const years = useMemo(() => { const y = new Date().getFullYear(); return Array.from({ length: 7 }, (_, i) => y - 3 + i) }, [])

  // Delete single transaction
  const handleDelete = async (id, nama) => {
    const { error } = await supabase.from('transaksi').delete().eq('id', id)
    if (error) { alert('Gagal menghapus: ' + error.message); return }
    setList(prev => prev.filter(t => t.id !== id))
  }

  // Clear all transactions in current month
  const handleClearMonth = async () => {
    const { error } = await supabase
      .from('transaksi').delete()
      .gte('created_at', start)
      .lte('created_at', end)
    if (error) { alert('Gagal menghapus: ' + error.message); return }
    setList([])
    setConfirmClear(false)
  }

  // Reset all rooms to SIAP_HUNI
  const handleResetRooms = async () => {
    const { error } = await supabase.from('kamar').update({
      status: 'SIAP_HUNI',
      nama_tamu: null,
      tanggal_checkin: null,
      tanggal_checkout: null,
      jumlah_malam: null,
      harga_per_malam: null,
      total_harga: null,
    }).neq('id', '00000000-0000-0000-0000-000000000000') // match all rows
    if (error) { alert('Gagal reset kamar: ' + error.message); return }
    alert('Semua kamar sudah di-reset ke Siap Huni.')
  }

  return (
    <div className="wp-page">
      {/* Top bar with back */}
      <div className="wp-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="wp-icon-btn" onClick={onBack} aria-label="Kembali">
            <Icons.Back size={18} />
          </button>
          <div className="wp-page-title">Riwayat</div>
        </div>
      </div>

      {/* Filters */}
      <div className="wp-toolbar" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="wp-filter-select"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {BULAN.map((nama, i) => <option key={nama} value={i + 1}>{nama}</option>)}
          </select>
          <select
            className="wp-filter-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="wp-toolbar-meta">
          <span>{list.length}</span> transaksi
        </div>
      </div>

      {/* Period total */}
      <div className="wp-txn-list" style={{ marginBottom: 0 }}>
        <div className="wp-recap-eyebrow" style={{ marginBottom: 6 }}>Total Pendapatan Periode</div>
        <div className="wp-recap-amount" style={{ fontSize: 40 }}>
          <span className="wp-recap-amount-prefix" style={{ fontSize: 32 }}>Rp</span>
          {Number(total).toLocaleString('id-ID')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{list.length} transaksi</div>
      </div>

      {loading ? (
        <div className="wp-loading">Memuat riwayat…</div>
      ) : list.length === 0 ? (
        <div className="wp-txn-list">
          <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Tidak ada transaksi di periode ini.</div>
        </div>
      ) : (
        <div className="wp-txn-list">
          <div className="wp-txn-header">
            <div className="wp-txn-header-title">Transaksi</div>
          </div>
          {list.map(t => (
            <div key={t.id} className="wp-txn-row">
              <div className="wp-txn-time">
                <div>{extractDate(t.created_at)}</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{extractTime(t.created_at)}</div>
              </div>
              <div className="wp-txn-icon" data-type="check-out">
                <Icons.Door size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="wp-txn-title">{t.nama_tamu}</div>
                <div className="wp-txn-sub">Kamar {t.nomor_kamar} · {t.jumlah_malam} malam</div>
              </div>
              <div className="wp-txn-amount" data-zero={!t.total_harga}>
                {t.total_harga ? '+' + fmtRp(t.total_harga) : '—'}
              </div>
              <button
                className="wp-icon-btn wp-txn-delete"
                onClick={() => handleDelete(t.id, t.nama_tamu)}
                aria-label="Hapus"
                title="Hapus catatan ini"
              >
                <Icons.Plus size={14} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions: Clear month + Reset rooms */}
      <div className="wp-txn-list" style={{ paddingTop: 8 }}>
        <div className="wp-recap-eyebrow" style={{ marginBottom: 12 }}>Kelola Data</div>
        
        {!confirmClear ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="wp-btn wp-btn-ghost"
              style={{ flex: 1 }}
              onClick={() => setConfirmClear(true)}
              disabled={list.length === 0}
            >
              <Icons.Broom size={14} /> Hapus transaksi bulan ini
            </button>
            <button
              className="wp-btn wp-btn-ghost"
              style={{ flex: 1, color: 'var(--terracotta)' }}
              onClick={() => {
                if (window.confirm('Reset SEMUA kamar ke Siap Huni? Data tamu akan dihapus dari kamar.')) {
                  handleResetRooms()
                }
              }}
            >
              <Icons.Wrench size={14} /> Reset semua kamar
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--cream-2)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 8, color: 'var(--ink)' }}>
              Hapus {list.length} transaksi?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Semua catatan transaksi bulan {BULAN[month - 1]} {year} akan dihapus permanen.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="wp-btn wp-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmClear(false)}>
                Batal
              </button>
              <button className="wp-btn wp-btn-danger" style={{ flex: 2 }} onClick={handleClearMonth}>
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
