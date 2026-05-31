import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabase } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/supabase/database-types'
import { OwnerTransactionsClient } from './owner-transactions-client'

export const dynamic = 'force-dynamic'

export default async function OwnerTransactionsPage() {
    const supabase = await createServerSupabase()
    
    // In a real app we'd fetch from payments table. Since we might not have populated it yet,
    // let's fetch bookings and simulate transactions or fetch actual payments if it exists.
    const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
            id,
            booking_id,
            amount,
            method,
            status,
            paid_at,
            created_at,
            booking:bookings!inner(booking_code, customer:profiles!user_id(full_name))
        `)
        .order('created_at', { ascending: false })

    let transactions: any[] = []

    if (!paymentsError && paymentsData && paymentsData.length > 0) {
        transactions = paymentsData
    } else {
        // Fallback if payments table is empty or doesn't exist
        const { data: bookings } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_code,
                total_amount,
                status,
                created_at,
                customer:profiles!user_id(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(20)
        
        if (bookings) {
            transactions = bookings.map((b: any) => ({
                id: b.id,
                booking_id: b.id,
                amount: b.total_amount,
                method: 'cash',
                status: b.status === 'finished' || b.status === 'picked_up' ? 'paid' : 'pending',
                paid_at: b.created_at,
                created_at: b.created_at,
                booking: {
                    booking_code: b.booking_code,
                    customer: b.customer || { full_name: 'Unknown' }
                }
            }))
        }
    }

    return (
        <OwnerTransactionsClient transactions={transactions} />
    )
}
