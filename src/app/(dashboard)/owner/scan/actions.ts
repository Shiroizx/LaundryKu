'use server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { updateOrderStatusAction } from '../orders/actions'

export async function lookupOrderAction(code: string) {
    try {
        const supabase = createAdminSupabase() // Bypass RLS to fetch profile data
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:profiles!user_id(id, full_name, email, phone)
            `)
            .ilike('booking_code', code.trim())
            .single()

        if (error) {
            // For demo purposes, we can fallback to null if not found
            return { success: true, data: null }
        }

        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateScannedOrderStatusAction(orderId: string, newStatus: string) {
    return updateOrderStatusAction(orderId, newStatus)
}
