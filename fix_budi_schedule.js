const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fix() {
    const { data: newBudi } = await supabase.from('employees').select('id').eq('employee_code', 'EMP-BUDI').single();
    if (!newBudi) return;
    
    const { data: oldSchedules } = await supabase.from('employee_schedules').select('*').eq('employee_id', 'e1111111-0001-0001-0001-e11111111111');
    if (oldSchedules && oldSchedules.length > 0) {
        for (const s of oldSchedules) {
            await supabase.from('employee_schedules').upsert({
                employee_id: newBudi.id,
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
                is_active: s.is_active
            }, { onConflict: 'employee_id, day_of_week' });
        }
        console.log(`Memindahkan ${oldSchedules.length} jadwal shift untuk Budi.`);
        await supabase.from('employee_schedules').delete().eq('employee_id', 'e1111111-0001-0001-0001-e11111111111');
    }
}
fix();
