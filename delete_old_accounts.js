const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const oldUserIds = [
  'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', // Budi
  'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', // Rina
  'cccccccc-0003-0003-0003-cccccccccccc', // Citra
  'dddddddd-0004-0004-0004-dddddddddddd'  // Doni
];

async function deleteOld() {
    console.log("Menghapus data 4 akun dummy lama dari sistem...");
    
    // Menghapus dari tabel profiles akan otomatis menghapus dari tabel employees
    // berkat ON DELETE CASCADE yang ada di database.
    const { data, error } = await supabase
        .from('profiles')
        .delete()
        .in('id', oldUserIds);
        
    if (error) {
        console.error("Gagal menghapus profil lama:", error.message);
    } else {
        console.log("Berhasil! Semua data akun lama sudah bersih dari sistem aplikasi.");
    }
}

deleteOld();
