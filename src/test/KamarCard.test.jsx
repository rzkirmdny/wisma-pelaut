import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KamarCard from '../components/KamarCard'

const baseKamar = {
  id: 1,
  nomor_kamar: 1,
  status: 'SIAP_HUNI',
  harga_per_malam: 160000,
  nama_tamu: null,
  tanggal_checkin: null,
  tanggal_checkout: null,
  total_harga: null,
}

describe('KamarCard', () => {
  it('renders room name from nomor_kamar', () => {
    render(<KamarCard kamar={baseKamar} />)
    expect(screen.getByText('Bawah 1')).toBeInTheDocument()
  })

  it('shows "Siap huni" for SIAP_HUNI status', () => {
    render(<KamarCard kamar={baseKamar} />)
    expect(screen.getByText('Siap huni')).toBeInTheDocument()
  })

  it('shows guest name for TERISI status', () => {
    const kamar = { ...baseKamar, status: 'TERISI', nama_tamu: 'Pak Ahmad', tanggal_checkin: '2026-04-18' }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Pak Ahmad')).toBeInTheDocument()
  })

  it('shows "Tunggu bersih" for PEMBERSIHAN status', () => {
    const kamar = { ...baseKamar, status: 'PEMBERSIHAN' }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Tunggu bersih')).toBeInTheDocument()
  })

  it('shows "Dipesan" for DIPESAN status', () => {
    const kamar = { ...baseKamar, status: 'DIPESAN' }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Dipesan')).toBeInTheDocument()
  })

  it('shows "Perbaikan" for PERBAIKAN status', () => {
    const kamar = { ...baseKamar, status: 'PERBAIKAN' }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Perbaikan')).toBeInTheDocument()
  })

  it('displays price as 160rb for 160k rooms', () => {
    render(<KamarCard kamar={baseKamar} />)
    expect(screen.getByText('160rb')).toBeInTheDocument()
  })

  it('displays Gudang name for nomor_kamar 9', () => {
    const kamar = { ...baseKamar, nomor_kamar: 9 }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Gudang')).toBeInTheDocument()
  })

  it('displays Rizky Kecil for nomor_kamar 19', () => {
    const kamar = { ...baseKamar, nomor_kamar: 19 }
    render(<KamarCard kamar={kamar} />)
    expect(screen.getByText('Rizky Kecil')).toBeInTheDocument()
  })

  it('hides room number when showNumbers is false', () => {
    render(<KamarCard kamar={baseKamar} showNumbers={false} />)
    expect(screen.queryByText('Bawah 1')).not.toBeInTheDocument()
  })

  it('shows occupancy label "Single" for base-price rooms', () => {
    render(<KamarCard kamar={baseKamar} />)
    expect(screen.getByText('Single')).toBeInTheDocument()
  })
})
