import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function check() {
  const { data: kamar } = await supabase.from('kamar').select('nomor_kamar, status, nama_tamu').limit(5)
  const { data: tx } = await supabase.from('transaksi').select('id, nama_tamu').limit(5)
  
  console.log('--- ISI TABEL KAMAR (5 BARIS) ---')
  console.table(kamar)
  
  console.log('--- ISI TABEL TRANSAKSI (5 BARIS) ---')
  console.table(tx)
}

check()
