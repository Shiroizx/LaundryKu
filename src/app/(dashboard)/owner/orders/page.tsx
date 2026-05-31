import { createServerSupabase } from '@/lib/supabase/server'
import OwnerOrdersClient from './owner-orders-client'

export default async function OwnerOrdersPage() {
    const supabase = await createServerSupabase()
    
    const { data: ordersData } = await supabase
        .from('bookings')
        .select(`
            *,
            customer:profiles!user_id(id, full_name, email, phone),
            employee:employees!employee_id(
                id,
                profile:profiles!user_id(id, full_name)
            )
        `)
        .order('created_at', { ascending: false })

    return <OwnerOrdersClient initialOrders={ordersData || []} />
}