'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Kita harus menggunakan Service Role Key untuk bypass RLS dan mengakses Auth Admin API
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function createEmployeeAccountAction(data: {
    fullName: string
    email: string
    password?: string
    employeeCode: string
    position: string
    hourlyRate: number
    hireDate?: string | null
}) {
    try {
        const finalPassword = data.password || 'laundry123'
        
        // 1. Buat user di Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: { role: 'employee', full_name: data.fullName }
        })

        if (authError) {
            throw new Error(`Gagal membuat akun Auth: ${authError.message}`)
        }

        const userId = authData.user.id

        // 2. Insert ke tabel employees
        const { error: empError } = await supabaseAdmin
            .from('employees')
            .insert({
                user_id: userId,
                employee_code: data.employeeCode,
                position: data.position,
                hourly_rate: data.hourlyRate,
                is_active: true,
                hire_date: data.hireDate || null
            })

        if (empError) {
            // Rollback auth user jika insert employee gagal
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw new Error(`Gagal menyimpan data pegawai: ${empError.message}`)
        }

        return { success: true, userId }
    } catch (err: any) {
        console.error('Error creating employee:', err)
        return { success: false, error: err.message || 'Terjadi kesalahan internal' }
    }
}

export async function updateEmployeeAccountAction(data: {
    employeeId: string
    userId: string
    fullName: string
    email: string
    password?: string
    employeeCode: string
    position: string
    hourlyRate: number
    hireDate?: string | null
}) {
    try {
        // 1. Update user di Auth (jika email/password diisi/diubah)
        const updateData: any = {
            email: data.email,
            user_metadata: { full_name: data.fullName }
        }
        if (data.password) {
            updateData.password = data.password
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            data.userId,
            updateData
        )

        if (authError) {
            throw new Error(`Gagal update akun Auth: ${authError.message}`)
        }

        // 2. Update profiles (untuk sinkronisasi full_name karena kadang trigger auth tidak mengupdate profile yang sudah ada)
        await supabaseAdmin
            .from('profiles')
            .update({ full_name: data.fullName, email: data.email })
            .eq('id', data.userId)

        // 3. Update tabel employees
        const { error: empError } = await supabaseAdmin
            .from('employees')
            .update({
                employee_code: data.employeeCode,
                position: data.position,
                hourly_rate: data.hourlyRate,
                hire_date: data.hireDate || null
            })
            .eq('id', data.employeeId)

        if (empError) {
            throw new Error(`Gagal update data pegawai: ${empError.message}`)
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error updating employee:', err)
        return { success: false, error: err.message || 'Terjadi kesalahan internal' }
    }
}

export async function getReportDataForExport(timeframe: 'weekly' | 'monthly' | 'yearly') {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    
    if (timeframe === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
    } else if (timeframe === 'monthly') {
        startDate.setDate(startDate.getDate() - 30)
    } else if (timeframe === 'yearly') {
        startDate.setDate(startDate.getDate() - 365)
    }

    const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
            id,
            booking_code,
            created_at,
            total_amount,
            status,
            service_type,
            customer:profiles(full_name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error('Gagal mengambil data laporan')
    }

    return bookings
}
