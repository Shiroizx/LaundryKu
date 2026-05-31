import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerPaymentsClient } from './customer-payments-client'
import type { Booking, Payment } from '@/lib/supabase/database-types'

type BookingWithPayment = Booking & { payment?: Payment[] }

export const metadata = {
    title: 'Pembayaran - LaundryKu',
    description: 'Daftar tagihan pembayaran laundry Anda',
}

export default async function CustomerPaymentsPage() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melihat tagihan pembayaran Anda.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // Fetch initial bookings and payments
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, payment:payments(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (bookingsError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Gagal memuat pembayaran: {bookingsError.message}</p>
            </div>
        )
    }

    const bookings = (bookingsData || []) as BookingWithPayment[]

    return <CustomerPaymentsClient initialBookings={bookings} />
}
