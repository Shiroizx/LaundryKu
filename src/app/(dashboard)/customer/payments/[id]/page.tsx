import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { PaymentDetailClient } from './payment-detail-client'
import type { Booking, Payment, StorePaymentMethod } from '@/lib/supabase/database-types'
import { notFound } from 'next/navigation'

type BookingWithPayment = Booking & { payment?: Payment[] }

export const metadata = {
    title: 'Detail Pembayaran - LaundryKu',
    description: 'Selesaikan pembayaran untuk pesanan Anda',
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melanjutkan pembayaran.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // 1. Fetch booking details
    const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, payment:payments(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (bookingError || !bookingData) {
        return notFound()
    }

    // 2. Fetch active payment methods
    const { data: paymentMethodsData } = await supabase
        .from('store_payment_methods')
        .select('*')
        .eq('is_active', true)

    const booking = bookingData as BookingWithPayment
    const paymentMethods = (paymentMethodsData || []) as StorePaymentMethod[]

    return <PaymentDetailClient booking={booking} paymentMethods={paymentMethods} />
}
