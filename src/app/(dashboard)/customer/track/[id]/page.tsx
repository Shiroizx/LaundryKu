import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { OrderTrackingClient } from './order-tracking-client'
import type { Booking, Payment } from '@/lib/supabase/database-types'
import { notFound } from 'next/navigation'

type BookingWithPayment = Booking & { payment?: Payment[] }

export const metadata = {
    title: 'Lacak Pesanan - LaundryKu',
    description: 'Lacak status pesanan laundry Anda',
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melacak pesanan Anda.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // Fetch initial booking
    const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            payment:payments(*),
            employee:employees(
                *,
                profile:profiles(full_name, phone)
            )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (bookingError || !bookingData) {
        return notFound()
    }

    const booking = bookingData as BookingWithPayment

    return <OrderTrackingClient bookingId={id} initialBooking={booking} />
}
