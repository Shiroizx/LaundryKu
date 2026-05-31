'use server'
import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function deleteEmployeeAction(id: string, userId: string | null) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase.from('employees').delete().eq('id', id)
        if (error) throw error

        // If you also want to delete the user completely from auth when an employee is deleted:
        // (Currently the client version just deleted the employee row, we will keep that behavior 
        // but if we want to delete auth user, uncomment below)
        /*
        if (userId) {
            await supabaseAdmin.auth.admin.deleteUser(userId)
        }
        */

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function toggleActiveAction(id: string, currentStatus: boolean) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase.from('employees')
            .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)
            
        if (error) throw error
        
        revalidatePath('/owner/employees')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function saveSchedulesAction(employeeId: string, activeSchedules: any[]) {
    try {
        const supabase = await createServerSupabase()
        
        // Delete all old schedules first
        await supabase.from('employee_schedules').delete().eq('employee_id', employeeId)

        if (activeSchedules.length > 0) {
            const rows = activeSchedules.map(s => ({
                employee_id: employeeId,
                day_of_week: s.dayOfWeek,
                start_time: s.startTime,
                end_time: s.endTime,
                is_active: true
            }))

            const { error } = await supabase.from('employee_schedules').insert(rows)
            if (error) throw error
        }

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
export async function getSchedulesAction(employeeId: string) {
    try {
        const supabase = await createServerSupabase()
        const { data, error } = await supabase
            .from('employee_schedules')
            .select('day_of_week, start_time, end_time, is_active')
            .eq('employee_id', employeeId)
            .eq('is_active', true)
            
        if (error) throw error
        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
