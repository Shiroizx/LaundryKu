'use server'

import { createClient } from '@supabase/supabase-js'
import type { BookingStatus } from '@/lib/supabase/database-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function updateCustomerBookingStatusAction(bookingId: string, newStatus: BookingStatus, userId: string) {
    // Optional: verify that the booking belongs to the customer
    const { data: booking, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('user_id')
        .eq('id', bookingId)
        .single()

    if (fetchError || !booking) {
        console.error('Fetch error:', fetchError)
        throw new Error('Pesanan tidak ditemukan.')
    }

    if (booking.user_id !== userId) {
        throw new Error('Anda tidak memiliki akses ke pesanan ini.')
    }

    const { error } = await supabaseAdmin
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
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
