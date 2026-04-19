import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function seed() {
  console.log('--- Memulai Seeding Data Dummy Wisma Pelaut ---')

  // 1. Reset Status Kamar (Bersihkan dulu agar fresh)
  await supabase.from('kamar').update({
    status: 'SIAP_HUNI',
    nama_tamu: null, tanggal_checkin: null, tanggal_checkout: null,
    jumlah_malam: null, harga_per_malam: 150000, total_harga: null
  }).neq('nomor_kamar', '0')

  // 2. Isi Kamar TERISI (Simulasi 5 tamu)
  const guests = [
    { no: '101', nama: 'Bpk. Ahmad Subarjo', in: '2026-04-18', out: '2026-04-20', malam: 2, price: 150000 },
    { no: '105', nama: 'Siti Aminah', in: '2026-04-19', out: '2026-04-21', malam: 2, price: 165000 },
    { no: '203', nama: 'Capt. Morgan', in: '2026-04-17', out: '2026-04-25', malam: 8, price: 285000 },
    { no: '208', nama: 'Lilik Handayani', in: '2026-04-19', out: '2026-04-20', malam: 1, price: 150000 },
    { no: '302', nama: 'Rizki Ramadhan', in: '2026-04-19', out: '2026-04-22', malam: 3, price: 165000 },
  ]

  for (const g of guests) {
    await supabase.from('kamar').update({
      status: 'TERISI',
      nama_tamu: g.nama,
      tanggal_checkin: g.in,
      tanggal_checkout: g.out,
      jumlah_malam: g.malam,
      harga_per_malam: g.price,
      total_harga: g.malam * g.price
    }).eq('nomor_kamar', g.no)
  }

  // 3. Isi Status Lainnya
  await supabase.from('kamar').update({ status: 'PEMBERSIHAN' }).in('nomor_kamar', ['102', '103', '205'])
  await supabase.from('kamar').update({ status: 'DIPESAN' }).in('nomor_kamar', ['104', '201'])
  await supabase.from('kamar').update({ status: 'PERBAIKAN' }).eq('nomor_kamar', '305')

  // 4. Isi Transaksi (Riwayat)
  // Bulan Ini (April 2026) - Total sekitar 4.5jt
  const txThisMonth = [
    { nomor_kamar: '101', nama_tamu: 'Doni Setiadi', malam: 2, total: 300000, date: '2026-04-05T10:00:00' },
    { nomor_kamar: '204', nama_tamu: 'Anita Wijaya', malam: 3, total: 495000, date: '2026-04-08T11:30:00' },
    { nomor_kamar: '301', nama_tamu: 'Bambang HK', malam: 5, total: 1425000, date: '2026-04-12T09:15:00' },
    { nomor_kamar: '105', nama_tamu: 'Suryo', malam: 1, total: 150000, date: '2026-04-15T14:20:00' },
    { nomor_kamar: '202', nama_tamu: 'Eko Prasetyo', malam: 4, total: 600000, date: '2026-04-17T08:00:00' },
  ]

  // Bulan Lalu (Maret 2026) - Total sekitar 3.2jt (untuk delta comparison)
  const txLastMonth = [
    { nomor_kamar: '101', nama_tamu: 'Past Guest 1', malam: 2, total: 300000, date: '2026-03-10T10:00:00' },
    { nomor_kamar: '204', nama_tamu: 'Past Guest 2', malam: 10, total: 1500000, date: '2026-03-15T11:30:00' },
    { nomor_kamar: '301', nama_tamu: 'Past Guest 3', malam: 5, total: 1425000, date: '2026-03-20T09:15:00' },
  ]

  const allTx = [...txThisMonth, ...txLastMonth]
  for (const t of allTx) {
    await supabase.from('transaksi').insert({
      nomor_kamar: t.nomor_kamar,
      nama_tamu: t.nama_tamu,
      jumlah_malam: t.malam,
      total_harga: t.total,
      created_at: t.date,
      tanggal_checkin: t.date.split('T')[0],
      tanggal_checkout: t.date.split('T')[0] // simplified for dummy
    })
  }

  console.log('✅ Data dummy berhasil dimasukkan!')
}

seed()
