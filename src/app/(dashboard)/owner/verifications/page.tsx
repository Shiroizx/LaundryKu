import { createServerSupabase } from '@/lib/supabase/server'
import OwnerVerificationsClient from './owner-verifications-client'

export default async function OwnerVerificationsPage() {
    const supabase = await createServerSupabase()
    
    // Fetch pending payments
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            *,
            booking:bookings(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    return <OwnerVerificationsClient initialPayments={payments || []} />
}
