const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function transferBookings() {
  console.log("Mencari ID Employee Budi Baru...");
  const { data: newBudi, error: fetchErr } = await supabase
    .from('employees')
    .select('id')
    .eq('employee_code', 'EMP-BUDI')
    .single();

  if (fetchErr || !newBudi) {
    console.error("Gagal menemukan Budi Baru:", fetchErr);
    return;
  }

  console.log("Memindahkan pesanan lama (termasuk LY-08561E50) ke Budi Baru...");
  const { data, error } = await supabase
    .from('bookings')
    .update({ employee_id: newBudi.id })
    .eq('employee_id', 'e1111111-0001-0001-0001-e11111111111')
    .select('booking_code');

  if (error) {
    console.error("Gagal memindahkan pesanan:", error.message);
  } else {
    console.log("SELESAI! Berhasil memindahkan pesanan berikut ke akun Budi Baru:");
    console.log(data.map(b => b.booking_code).join(', '));
  }
}

transferBookings();
