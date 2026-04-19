import { Icons } from './Icon'

export default function TweaksPanel({ open, onClose, values, setValues }) {
  if (!open) return null

  const update = (k, v) => setValues(prev => ({ ...prev, [k]: v }))

  return (
    <div className="wp-tweaks">
      <div className="wp-tweaks-head">
        <div>
          <div className="wp-tweaks-title">Tweaks</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>Ubah tampilan</div>
        </div>
        <button className="wp-icon-btn" onClick={onClose} aria-label="tutup">
          <Icons.Plus size={16} style={{ transform: 'rotate(45deg)' }} />
        </button>
      </div>

      <div className="wp-tweaks-body">
        <div className="wp-tweak-row">
          <label className="wp-tweak-label">Suasana</label>
          <div className="wp-tweak-seg">
            {[['warm','Hangat'],['cool','Sejuk'],['paper','Kertas']].map(([k,l]) => (
              <button key={k} data-active={values.bgTone === k} onClick={() => update('bgTone', k)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="wp-tweak-row">
          <label className="wp-tweak-label">
            Sudut kartu
            <span style={{ fontFamily: 'var(--mono)' }}>{values.cardRadius}px</span>
          </label>
          <input
            type="range" min="4" max="28" step="2"
            value={values.cardRadius}
            onChange={e => update('cardRadius', Number(e.target.value))}
          />
        </div>

        <div className="wp-tweak-row" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="wp-tweak-label" style={{ marginBottom: 0 }}>Nomor kamar</label>
          <button
            className="wp-tweak-toggle"
            data-on={values.showRoomNumbers}
            onClick={() => update('showRoomNumbers', !values.showRoomNumbers)}
          >
            <span />
          </button>
        </div>

        <div className="wp-tweak-row">
          <label className="wp-tweak-label">Aksen warna</label>
          <div className="wp-tweak-swatches">
            {[
              { k: 'terracotta', c: '#C8553D' },
              { k: 'teal',       c: '#2B6465' },
              { k: 'ochre',      c: '#B88A3D' },
              { k: 'plum',       c: '#7A3B52' },
            ].map(s => (
              <button
                key={s.k}
                data-active={values.accent === s.k}
                onClick={() => update('accent', s.k)}
                style={{ background: s.c }}
                aria-label={s.k}
              />
            ))}
          </div>
        </div>

        <div className="wp-tweak-row">
          <label className="wp-tweak-label">Kepadatan</label>
          <div className="wp-tweak-seg">
            {[['compact','Padat'],['cozy','Lapang']].map(([k,l]) => (
              <button key={k} data-active={values.density === k} onClick={() => update('density', k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
