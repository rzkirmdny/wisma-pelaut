import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RoomSheet from '../components/RoomSheet'

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

describe('RoomSheet', () => {
  const noop = () => {}

  it('renders room name in header', () => {
    render(<RoomSheet kamar={baseKamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    expect(screen.getByText('Bawah 1')).toBeInTheDocument()
  })

  it('renders abbreviation badge for Bawah 1 as B1', () => {
    render(<RoomSheet kamar={baseKamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    expect(screen.getByText('B1')).toBeInTheDocument()
  })

  it('shows check-in button for SIAP_HUNI rooms', () => {
    render(<RoomSheet kamar={baseKamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    expect(screen.getByText(/Check-in/)).toBeInTheDocument()
  })

  it('shows occupancy selector (Single/Double/Triple) in check-in form', () => {
    render(<RoomSheet kamar={baseKamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    // Click Check-in to open form
    fireEvent.click(screen.getByText(/Check-in/))
    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Double')).toBeInTheDocument()
    expect(screen.getByText('Triple')).toBeInTheDocument()
  })

  it('shows correct prices for 160k base room occupancy options', () => {
    render(<RoomSheet kamar={baseKamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    fireEvent.click(screen.getByText(/Check-in/))
    // All three price tiers should be visible
    expect(screen.getAllByText(/160.000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/180.000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/200.000/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows correct prices for 180k base room', () => {
    const kamar180 = { ...baseKamar, nomor_kamar: 20, harga_per_malam: 180000 }
    render(<RoomSheet kamar={kamar180} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    fireEvent.click(screen.getByText(/Check-in/))
    expect(screen.getAllByText(/180.000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/200.000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/220.000/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows Tandai Bersih for PEMBERSIHAN rooms', () => {
    const kamar = { ...baseKamar, status: 'PEMBERSIHAN' }
    render(<RoomSheet kamar={kamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    expect(screen.getByText(/Tandai Bersih/)).toBeInTheDocument()
  })

  it('shows checkout and perpanjang for TERISI rooms', () => {
    const kamar = { ...baseKamar, status: 'TERISI', nama_tamu: 'Tamu Test', harga_per_malam: 160000, tanggal_checkin: '2026-04-18', tanggal_checkout: '2026-04-25', jumlah_malam: 7, total_harga: 1120000 }
    render(<RoomSheet kamar={kamar} onClose={noop} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    // 'Check-out' appears in both label and button — use getAllByText
    expect(screen.getAllByText(/Check-out/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Perpanjang/)).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<RoomSheet kamar={baseKamar} onClose={onClose} onCheckin={noop} onCheckout={noop} onBersih={noop} onPerpanjang={noop} onCatatPembayaran={noop} />)
    fireEvent.click(container.querySelector('.wp-sheet-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
