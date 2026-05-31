const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dummyAccounts = [
  { name: 'Budi', email: 'budi_baru@laundry.com', oldId: 'e1111111-0001-0001-0001-e11111111111', code: 'EMP-BUDI', position: 'Operator Laundry' },
  { name: 'Rina', email: 'rina_baru@laundry.com', oldId: 'e2222222-0002-0002-0002-e22222222222', code: 'EMP-RINA', position: 'Operator Laundry' },
  { name: 'Citra', email: 'citra_baru@laundry.com', oldId: 'e3333333-0003-0003-0003-e33333333333', code: 'EMP-CITRA', position: 'Operator Senior' },
  { name: 'Doni', email: 'doni_baru@laundry.com', oldId: 'e4444444-0004-0004-0004-e44444444444', code: 'EMP-DONI', position: 'Operator Laundry' },
];

async function run() {
  for (const account of dummyAccounts) {
    console.log(`\n--- Memproses ${account.name} ---`);
    
    // 1. Create auth user if not exists
    let newUserId;
    const { data: searchData } = await supabase.auth.admin.listUsers();
    const existingUser = searchData.users.find(u => u.email === account.email);
    
    if (existingUser) {
        newUserId = existingUser.id;
        console.log(`User auth ${account.name} sudah ada.`);
    } else {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: account.email,
            password: 'laundry123',
            email_confirm: true,
            user_metadata: { role: 'employee', full_name: `${account.name} (Baru)` }
        });
        if (error) { console.error("Error create user:", error); continue; }
        newUserId = newUser.user.id;
        console.log(`Berhasil membuat user auth ${account.name}.`);
    }

    // 2. Create employee if not exists
    const { data: empCheck } = await supabase.from('employees').select('id').eq('employee_code', account.code).single();
    let newEmpId;
    if (empCheck) {
        newEmpId = empCheck.id;
        console.log(`Employee record ${account.name} sudah ada.`);
    } else {
        const { data: newEmp, error: empErr } = await supabase.from('employees').insert({
            user_id: newUserId,
            employee_code: account.code,
            position: account.position,
            is_active: true,
            hire_date: new Date().toISOString().split('T')[0]
        }).select().single();
        if (empErr) { console.error("Error create employee:", empErr); continue; }
        newEmpId = newEmp.id;
        console.log(`Berhasil membuat employee record ${account.name}.`);
    }

    // 3. Transfer Bookings
    const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .update({ employee_id: newEmpId })
        .eq('employee_id', account.oldId)
        .select('id');
    if (bErr) console.error("Error update bookings:", bErr);
    else console.log(`Memindahkan ${bData?.length || 0} pesanan.`);

    // 4. Transfer Schedules
    const { data: oldSchedules } = await supabase.from('employee_schedules').select('*').eq('employee_id', account.oldId);
    if (oldSchedules && oldSchedules.length > 0) {
        let movedCount = 0;
        for (const s of oldSchedules) {
            const { error: upsertErr } = await supabase.from('employee_schedules').upsert({
                employee_id: newEmpId,
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
                is_active: s.is_active
            }, { onConflict: 'employee_id, day_of_week' });
            if (!upsertErr) movedCount++;
        }
        console.log(`Memindahkan ${movedCount} jadwal shift.`);
        await supabase.from('employee_schedules').delete().eq('employee_id', account.oldId);
    } else {
        console.log(`Tidak ada jadwal shift lama untuk dipindahkan.`);
    }
  }
  console.log("\nSELESAI SEMUA!");
}
run();
