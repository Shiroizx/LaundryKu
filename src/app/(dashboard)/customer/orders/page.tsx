import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerOrdersClient } from './customer-orders-client'
import type { Booking, Payment } from '@/lib/supabase/database-types'

type BookingWithPayment = Booking & { payment?: Payment[] }

export const metadata = {
    title: 'Riwayat Pesanan - LaundryKu',
    description: 'Lihat riwayat pesanan laundry Anda',
}

export default async function CustomerOrdersPage() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melihat pesanan Anda.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // Fetch initial bookings
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, payment:payments(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (bookingsError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Gagal memuat pesanan: {bookingsError.message}</p>
            </div>
        )
    }

    const bookings = (bookingsData || []) as BookingWithPayment[]

    return <CustomerOrdersClient initialBookings={bookings} userId={userId} />
}
