'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function verifyPaymentAction(paymentId: string, action: 'paid' | 'failed') {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('payments')
            .update({ 
                status: action,
                paid_at: action === 'paid' ? new Date().toISOString() : null
            })
            .eq('id', paymentId)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
