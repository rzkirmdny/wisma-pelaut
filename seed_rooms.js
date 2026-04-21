import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function seed() {
  console.log('--- Memulai Seeding Kamar Baru ---')

  // 1. Hapus semua data kamar lama
  const { error: delErr } = await supabase.from('kamar').delete().neq('id', 0)
  if (delErr) {
    console.error('Gagal menghapus kamar lama:', delErr.message)
    return
  }
  console.log('Kamar lama berhasil dihapus.')

  // 2. Data kamar baru — harga sesuai ketentuan
  //    Bawah 1-5,7,8 = 160k | Bawah 6 = 100k (kipas) | Gudang = 160k
  //    Atas 1-9 = 160k | Atas 10-12 = 180k | Rizky Besar = 180k
  const allKamar = [
    // Lantai Bawah
    { no: 1, harga: 160000 },
    { no: 2, harga: 160000 },
    { no: 3, harga: 160000 },
    { no: 4, harga: 160000 },
    { no: 5, harga: 160000 },
    { no: 6, harga: 100000 },  // kipas, non-AC
    { no: 7, harga: 160000 },
    { no: 8, harga: 160000 },
    { no: 9, harga: 160000 },  // Gudang
    // Lantai Atas
    { no: 11, harga: 160000 },  // Atas 1
    { no: 12, harga: 160000 },  // Atas 2
    { no: 13, harga: 160000 },  // Atas 3
    { no: 14, harga: 160000 },  // Atas 4
    { no: 15, harga: 160000 },  // Atas 5
    { no: 16, harga: 160000 },  // Atas 6
    { no: 17, harga: 160000 },  // Atas 7
    { no: 18, harga: 160000 },  // Atas 8
    { no: 19, harga: 160000 },  // Rizky Kecil
    { no: 20, harga: 180000 },  // Atas 10
    { no: 21, harga: 180000 },  // Atas 11
    { no: 22, harga: 180000 },  // Atas 12
    { no: 23, harga: 180000 },  // Rizky Besar
  ]

  let idCounter = 1
  const insertData = allKamar.map(k => ({
    id: idCounter++,
    nomor_kamar: k.no,
    status: 'SIAP_HUNI',
    harga_per_malam: k.harga
  }))

  const { error: insErr } = await supabase.from('kamar').insert(insertData)
  
  if (insErr) {
    console.error('Gagal insert kamar baru:', insErr.message)
  } else {
    console.log(`✅ Berhasil insert ${insertData.length} kamar baru!`)
    console.log('Rincian:')
    for (const k of insertData) {
      const { formatKamarName } = await import('./src/lib/utils.js')
      console.log(`  ${formatKamarName(k.nomor_kamar).padEnd(14)} → Rp ${k.harga_per_malam.toLocaleString('id-ID')}`)
    }
  }
}

seed()
