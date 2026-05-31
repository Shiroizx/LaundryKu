'use server'

import { createClient } from '@supabase/supabase-js'
import type { BookingStatus } from '@/lib/supabase/database-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function getEmployeeBookings(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get current employee data first
    const { data: empData } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single()

    // Using admin client to bypass RLS for profiles
    let todayQuery = supabaseAdmin
        .from('bookings')
        .select(`
            *,
            customer:profiles(*),
            payments(status)
        `)
        .neq('service_type', 'self_service')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

    // Only show unassigned orders or orders assigned to THIS employee
    if (empData) {
        todayQuery = todayQuery.or(`employee_id.is.null,employee_id.eq.${empData.id}`)
    } else {
        todayQuery = todayQuery.is('employee_id', null)
    }

    const { data: todayData, error: todayErr } = await todayQuery
    if (todayErr) throw todayErr

    let assignedData = []
    if (empData) {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                customer:profiles(*),
                payments(status)
            `)
            .eq('employee_id', empData.id)
            .neq('service_type', 'self_service')
            .not('status', 'in', '(finished,picked_up,cancelled)')
            .order('created_at', { ascending: false })
        if (!error) assignedData = data || []
    } else {
         const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                customer:profiles(*),
                payments(status)
            `)
            .neq('service_type', 'self_service')
            .not('status', 'in', '(finished,picked_up,cancelled)')
            .order('created_at', { ascending: false })
            .limit(20)
        if (!error) assignedData = data || []
    }

    return { todayData: todayData || [], assignedData }
}

export async function updateBookingStatusAction(bookingId: string, newStatus: BookingStatus, userId: string) {
    // get employee id
    const { data: empData } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = { status: newStatus, updated_at: new Date().toISOString() }
    
    // Assign employee to booking if they start processing it and they are an employee
    // Only set it if it's currently null, but we'll just set it anyway to the current employee processing it
    if (empData && newStatus === 'washing') {
        updatePayload.employee_id = empData.id
    }

    const { error } = await supabaseAdmin
        .from('bookings')
        .update(updatePayload)
        .eq('id', bookingId)

    if (error) throw error

    // handle machine release logic
    if (['ironing', 'finished', 'cancelled'].includes(newStatus)) {
        const { data: mBooking, error: mBookingErr } = await supabaseAdmin
            .from('machine_bookings')
            .select('machine_id')
            .eq('booking_id', bookingId)
            .is('end_time', null)
            .maybeSingle()

        if (!mBookingErr && mBooking?.machine_id) {
            await supabaseAdmin.from('machines').update({ status: 'available' }).eq('id', mBooking.machine_id)
            await supabaseAdmin.from('machine_bookings').update({ end_time: new Date().toISOString() }).eq('booking_id', bookingId).is('end_time', null)
        }
    }

    // auto-assign machine logic
    if (['washing', 'ironing'].includes(newStatus)) {
        const requiredType = newStatus === 'washing' ? 'washing_machine' : 'iron'
        const { data: machine } = await supabaseAdmin
            .from('machines')
            .select('id')
            .eq('machine_type', requiredType)
            .eq('status', 'available')
            .limit(1)
            .maybeSingle()
            
        if (machine) {
            await supabaseAdmin.from('machines').update({ status: 'in_use' }).eq('id', machine.id)
            await supabaseAdmin.from('machine_bookings').insert({
                machine_id: machine.id,
                booking_id: bookingId,
                start_time: new Date().toISOString()
            })
        }
    }
    return true
}

export async function getEmployeeOrdersHistory(userId: string) {
    const { data: empData } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single()

    let query = supabaseAdmin
        .from('bookings')
        .select('*, customer:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50)

    if (empData) {
        query = query.eq('employee_id', empData.id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
}
