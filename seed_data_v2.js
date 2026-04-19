import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function seed() {
  console.log('--- Mencoba Seeding Ulang dengan Deteksi ID ---')

  // Ambil semua kamar untuk tahu ID-nya
  const { data: allRooms } = await supabase.from('kamar').select('id, nomor_kamar')
  if (!allRooms || allRooms.length === 0) {
    console.error('❌ Tidak ada data di tabel kamar!')
    return
  }

  const findId = (no) => allRooms.find(r => String(r.nomor_kamar) === String(no))?.id

  // 1. Update status variatif
  const updates = [
    { no: '1', status: 'TERISI', guest: 'Pak Ahmad Subarjo', in: '2026-04-18', out: '2026-04-20', malam: 2, total: 300000 },
    { no: '2', status: 'TERISI', guest: 'Siti Aminah', in: '2026-04-19', out: '2026-04-21', malam: 2, total: 330000 },
    { no: '3', status: 'PEMBERSIHAN' },
    { no: '4', status: 'DIPESAN' },
    { no: '5', status: 'PERBAIKAN' },
    { no: '6', status: 'PEMBERSIHAN' },
  ]

  for (const u of updates) {
    const id = findId(u.no)
    if (id) {
      console.log(`Updating Kamar ${u.no} (ID: ${id}) to ${u.status}`)
      await supabase.from('kamar').update({
        status: u.status,
        nama_tamu: u.guest || null,
        tanggal_checkin: u.in || null,
        tanggal_checkout: u.out || null,
        jumlah_malam: u.malam || null,
        total_harga: u.total || null,
        harga_per_malam: u.total ? u.total / u.malam : 150000
      }).eq('id', id)
    }
  }

  // 2. Insert Transaksi (Hanya pakai kolom yang pasti ada)
  const txData = [
    { nomor_kamar: '1', nama_tamu: 'Doni Setiadi', jumlah_malam: 2, total_harga: 300000, created_at: '2026-04-05T10:00:00Z' },
    { nomor_kamar: '5', nama_tamu: 'Anita Wijaya', jumlah_malam: 3, total_harga: 495000, created_at: '2026-04-08T11:30:00Z' },
    { nomor_kamar: '10', nama_tamu: 'Bambang HK', jumlah_malam: 5, total_harga: 1425000, created_at: '2026-04-12T09:15:00Z' },
    { nomor_kamar: '1', nama_tamu: 'Tamu Maret 1', jumlah_malam: 2, total_harga: 300000, created_at: '2026-03-10T10:00:00Z' },
    { nomor_kamar: '2', nama_tamu: 'Tamu Maret 2', jumlah_malam: 5, total_harga: 750000, created_at: '2026-03-20T11:00:00Z' }
  ]

  console.log('Inserting transactions...')
  const { error } = await supabase.from('transaksi').insert(txData)
  if (error) console.error('❌ Gagal insert transaksi:', error.message)
  else console.log('✅ Berhasil insert transaksi!')
}

seed()
