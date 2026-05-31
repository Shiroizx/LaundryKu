'use server'

import { createServerSupabase } from '@/lib/supabase/server'

const toLocalISOString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzoffset).toISOString();
}

export async function loadMachineBookingsAction(machineId: string) {
    try {
        const supabase = await createServerSupabase()
        const todayStr = toLocalISOString(new Date()).split('T')[0]
        const { data, error } = await supabase
            .from('machine_bookings')
            .select(`
                id,
                start_time,
                end_time,
                booking:bookings(status)
            `)
            .eq('machine_id', machineId)
            .gte('start_time', `${todayStr}T00:00:00`)
        
        if (error) throw error
        return { data: data || [] }
    } catch (err: any) {
        console.error('Error loading machine bookings:', err)
        return { error: err.message || 'Gagal memuat jadwal' }
    }
}

export async function createMachineBookingAction(data: {
    machine_id: string
    machine_number: string
    machine_type: string
    price_per_kg: number
    weight_kg: number
    start_time: string
    end_time: string
    duration: number
    notes: string | null
    is_immediate: boolean
}) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Anda harus login terlebih dahulu')

        const userId = user.id

        // 1. Generate booking code
        const date = new Date()
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
        const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        const bookingCode = `ORD-${dateStr}-${randomStr}`

        const weight = data.weight_kg

        // 2. Insert booking record
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_code: bookingCode,
                user_id: userId,
                employee_id: null,
                service_type: 'self_service',
                status: 'pending',
                weight_kg: weight,
                total_amount: weight * (data.price_per_kg || 5000),
                pickup_time: data.start_time,
                notes: data.notes
            })
            .select()
            .single()

        if (bookingError) throw bookingError

        // 3. Insert machine_bookings record
        const { error: machineBookingError } = await supabase
            .from('machine_bookings')
            .insert({
                booking_id: booking.id,
                machine_id: data.machine_id,
                start_time: data.start_time,
                end_time: data.end_time
            })

        if (machineBookingError) {
            // roll back booking
            await supabase.from('bookings').delete().eq('id', booking.id)
            throw machineBookingError
        }

        // 4. Update machine status to 'in_use' if booking starts immediately
        if (data.is_immediate) {
            const { error: machineUpdateError } = await supabase
                .from('machines')
                .update({ status: 'in_use' })
                .eq('id', data.machine_id)

            if (machineUpdateError) {
                console.error('Failed to update machine status:', machineUpdateError)
            }
        }

        return { success: true, booking_id: booking.id }
    } catch (err: any) {
        console.error('Machine booking error:', err)
        return { error: err.message || 'Terjadi kesalahan saat memproses pesanan' }
    }
}
