import { useState, useEffect } from 'react'
import KamarPage from './pages/KamarPage'
import RekapPage from './pages/RekapPage'
import RiwayatPage from './pages/RiwayatPage'
import TweaksPanel from './components/TweaksPanel'
import { Icons } from './components/Icon'
import './index.css'

const TWEAK_DEFAULTS = {
  bgTone: 'warm',
  cardRadius: 16,
  showRoomNumbers: true,
  accent: 'terracotta',
  density: 'compact',
  isDarkMode: false,
}

const NAV_ITEMS = [
  { id: 'kamar',   label: 'Kamar',   Icon: Icons.Grid },
  { id: 'rekap',   label: 'Rekap',   Icon: Icons.Wallet },
  { id: 'riwayat', label: 'Riwayat', Icon: Icons.Clock },
  { id: 'tweaks',  label: 'Tampilan',Icon: Icons.Sliders },
]

function Brand({ compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="wp-brand-logo">
        <span style={{ marginTop: -2 }}>Wp</span>
      </div>
      <div>
        <div className="wp-brand-name">Wisma Pelaut</div>
        {!compact && <div className="wp-brand-sub">Est. 1987 · Tanjung Perak</div>}
      </div>
    </div>
  )
}

function Sidebar({ page, setPage, onTweaks }) {
  return (
    <aside className="wp-sidebar">
      <div className="wp-sidebar-brand">
        <Brand />
      </div>
      <nav className="wp-sidebar-nav">
        {NAV_ITEMS.filter(i => i.id !== 'tweaks').map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              className="wp-nav-item"
              data-active={active}
              onClick={() => setPage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active && <span className="wp-nav-active-dot" />}
            </button>
          )
        })}
      </nav>
      <div className="wp-sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 34,
            background: 'var(--terracotta-soft)', color: 'var(--terracotta-deep)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--serif)', fontSize: 15,
          }}>En</div>
          <div style={{ lineHeight: 1.3, fontSize: 13 }}>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>Bu Endang</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 11, fontFamily: 'var(--mono)' }}>Shift pagi</div>
          </div>
          <button className="wp-icon-btn" style={{ marginLeft: 'auto' }} onClick={onTweaks} aria-label="Tweaks">
            <Icons.Sliders size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem('wp:page') || 'kamar')
  const [tweaks, setTweaks] = useState(() => {
    try {
      const stored = localStorage.getItem('wp:tweaks')
      return stored ? { ...TWEAK_DEFAULTS, ...JSON.parse(stored) } : TWEAK_DEFAULTS
    } catch { return TWEAK_DEFAULTS }
  })
  const [tweaksOpen, setTweaksOpen] = useState(false)

  useEffect(() => { localStorage.setItem('wp:page', page) }, [page])

  useEffect(() => {
    localStorage.setItem('wp:tweaks', JSON.stringify(tweaks))
    document.body.dataset.tone    = tweaks.bgTone
    document.body.dataset.accent  = tweaks.accent
    document.body.dataset.density = tweaks.density
    document.body.dataset.theme   = tweaks.isDarkMode ? 'dark' : 'light'
    document.documentElement.style.setProperty('--card-radius', tweaks.cardRadius + 'px')
  }, [tweaks])

  const handleNav = (id) => {
    if (id === 'tweaks') { setTweaksOpen(o => !o); return }
    setPage(id)
  }

  return (
    <div className="wp-app">
      <Sidebar page={page} setPage={setPage} onTweaks={() => setTweaksOpen(o => !o)} />

      <main className="wp-main">
        {page === 'kamar'   && <KamarPage tweaks={tweaks} />}
        {page === 'rekap'   && <RekapPage onOpenRiwayat={() => setPage('riwayat')} />}
        {page === 'riwayat' && <RiwayatPage onBack={() => setPage('rekap')} />}
      </main>

      <nav className="wp-bottomnav">
        <div className="wp-bottomnav-inner">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className="wp-bn-item"
              data-active={(id === 'tweaks' ? tweaksOpen : page === id) ? 'true' : 'false'}
              onClick={() => handleNav(id)}
            >
              <Icon size={20} stroke={page === id ? 1.8 : 1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        values={tweaks}
        setValues={setTweaks}
      />
    </div>
  )
}
