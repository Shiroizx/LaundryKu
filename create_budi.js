const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBudi() {
  console.log("Mencoba membuat akun Budi via Admin API...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'budi_baru@laundry.com',
    password: 'laundry123',
    email_confirm: true,
    user_metadata: { role: 'employee', full_name: 'Budi (Akun Baru)' }
  });

  if (error) {
    console.error("Gagal membuat user:", error.message);
    return;
  }

  console.log("Berhasil membuat user Budi Baru:", data.user.id);
  
  // Karena trigger di database sudah otomatis menambahkan ke tabel profiles,
  // kita tinggal tambahkan ke tabel employees
  console.log("Menambahkan Budi Baru ke tabel employees...");
  
  const { error: empError } = await supabase
    .from('employees')
    .insert({
      user_id: data.user.id,
      employee_code: 'EMP-BUDI',
      position: 'Operator Laundry',
      is_active: true,
      hire_date: new Date().toISOString().split('T')[0]
    });

  if (empError) {
    console.error("Gagal menambahkan ke tabel employees:", empError.message);
  } else {
    console.log("SELESAI! Silakan login dengan email: budi_baru@laundry.com dan password: laundry123");
  }
}

createBudi();
