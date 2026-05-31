'use server'

import { createServerSupabase } from '@/lib/supabase/server'

function calculateTotal(serviceType: string, weightKg: number) {
    const prices = {
        'full_service': 8000,
        'washing_only': 5000,
        'ironing_only': 5000,
        'express': 15000,
        'self_service': 5000
    }
    return (prices[serviceType as keyof typeof prices] || 8000) * (weightKg || 1)
}

function generateBookingCode() {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD-${dateStr}-${randomStr}`
}

export async function createBookingAction(data: {
    service_type: string
    employee_id?: string | null
    weight_kg?: number | null
    pickup_time?: string | null
    notes?: string | null
}) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Anda belum login')

        const total = calculateTotal(data.service_type, data.weight_kg || 0)

        const { data: booking, error: insertError } = await supabase
            .from('bookings')
            .insert({
                booking_code: generateBookingCode(),
                user_id: user.id,
                employee_id: data.employee_id || null,
                service_type: data.service_type,
                status: 'pending',
                weight_kg: data.weight_kg || null,
                notes: data.notes || null,
                pickup_time: data.pickup_time ? new Date(data.pickup_time).toISOString() : null,
                total_amount: total,
            })
            .select()
            .single()

        if (insertError) {
            throw new Error(insertError.message || 'Gagal menyimpan pesanan ke database')
        }
        
        // We can't return Date objects or complex Supabase objects from Server Actions
        // so we return the ID to redirect.
        return { success: true, bookingId: booking.id }
    } catch (err: any) {
        console.error('Insert Booking Error:', err)
        return { error: err.message || 'Gagal membuat pesanan' }
    }
}
