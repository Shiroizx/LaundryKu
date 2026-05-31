'use client'

import { useCustomerDashboard } from '@/hooks/use-customer-dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/supabase/database-types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { Booking, Payment } from '@/lib/supabase/database-types'

type BookingWithPayment = Booking & { payment?: Payment[] }

interface CustomerPaymentsClientProps {
    initialBookings: BookingWithPayment[]
}

export function CustomerPaymentsClient({ initialBookings }: CustomerPaymentsClientProps) {
    const { bookings, error, refresh } = useCustomerDashboard({
        initialBookings
    })
    const router = useRouter()

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p className="text-rose-600 font-medium">Gagal memuat pembayaran: {error.message}</p>
                <Button onClick={() => refresh(false)} className="mt-4 bg-rose-600 hover:bg-rose-700">
                    Coba Lagi
                </Button>
            </div>
        )
    }

    // Filter only bookings that are NOT paid yet
    const unpaidBookings = bookings.filter(booking => {
        const paymentArray = booking.payment || []
        const hasPayment = paymentArray.find(p => p.status === 'paid' || p.status === 'pending')
        const isFinished = booking.status === 'finished' || booking.status === 'picked_up'
        return !hasPayment && !isFinished
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tagihan Belum Lunas</h1>
                <p className="text-gray-500 mt-1">Daftar pesanan Anda yang membutuhkan pembayaran</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {unpaidBookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900">Tidak ada tagihan tertunggak</p>
                            <p>Semua pesanan Anda sudah dibayar. Cek menu Pesanan Saya.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {unpaidBookings.map(booking => {
                                const paymentArray = booking.payment || []
                                const pendingPayment = paymentArray.find((p: any) => p.status === 'pending')
                                
                                return (
                                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 capitalize">
                                                    Order #{booking.booking_code}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(booking.created_at)} • {booking.service_type.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto flex flex-col items-start sm:items-end border-t sm:border-0 pt-4 sm:pt-0">
                                            <p className="font-bold text-lg text-gray-900 mb-2">
                                                {formatCurrency(Number(booking.total_amount))}
                                            </p>
                                            <div className="flex gap-2 items-center">
                                                {pendingPayment ? (
                                                    <Badge variant="warning" className="px-3 py-1">
                                                        <svg className="w-4 h-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Menunggu Verifikasi Kasir
                                                    </Badge>
                                                ) : (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => router.push(`/customer/payments/${booking.id}`)}
                                                    >
                                                        Bayar Sekarang
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
