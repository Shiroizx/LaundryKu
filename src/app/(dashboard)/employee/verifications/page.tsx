import { createServerSupabase } from '@/lib/supabase/server'
import { EmployeeVerificationsClient } from './employee-verifications-client'

export default async function EmployeeVerificationsPage() {
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

    return <EmployeeVerificationsClient initialPayments={payments || []} />
}
