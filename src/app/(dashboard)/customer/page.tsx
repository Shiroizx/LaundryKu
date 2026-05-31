import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerDashboardClient } from './customer-dashboard-client'

export default async function CustomerDashboard() {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return (
            <div className="space-y-6">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-rose-600 font-medium">Please login to view your dashboard</p>
                </div>
            </div>
        )
    }

    const currentId = user.id

    // Fetch Data Concurrently
    const [profileRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentId).single(),
        supabase.from('bookings').select('*, payment:payments(*)').eq('user_id', currentId).order('created_at', { ascending: false })
    ])

    const bookings = bookingsRes.data || []
    
    // Extract payment data from the joined query
    const payments = bookings.flatMap((b: any) => b.payment || [])

    const profile = profileRes.data

    const activeBookings = bookings.filter(
        (b: any) => !['finished', 'picked_up', 'cancelled'].includes(b.status)
    )

    const totalSpent = payments
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

    const stats = {
        totalOrders: bookings.length,
        totalSpent,
        readyToPickup: bookings.filter((b: any) => b.status === 'finished').length,
    }

    return (
        <CustomerDashboardClient 
            profile={profile} 
            bookings={bookings} 
            activeBookings={activeBookings} 
            stats={stats} 
            payments={payments} 
        />
    )
}