'use server'
import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            
        if (error) throw error
        
        revalidatePath('/owner/orders')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
