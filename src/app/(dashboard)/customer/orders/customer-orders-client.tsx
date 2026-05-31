'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCustomerDashboard } from '@/hooks/use-customer-dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BOOKING_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/supabase/database-types'
import type { Booking, Payment } from '@/lib/supabase/database-types'

type BookingWithPayment = Booking & { payment?: Payment[] }

type BadgeVariant = NonNullable<BadgeProps['variant']>

const badgeVariantMap: Record<string, BadgeVariant> = {
    warning: 'warning',
    cyan: 'cyan',
    indigo: 'indigo',
    success: 'success',
    emerald: 'emerald',
    danger: 'danger',
    default: 'default',
}

const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    ...Object.entries(BOOKING_STATUS_CONFIG).map(([key, config]) => ({
        value: key,
        label: config.label,
    })),
]

interface CustomerOrdersClientProps {
    initialBookings: BookingWithPayment[]
    userId: string
}

export function CustomerOrdersClient({ initialBookings, userId }: CustomerOrdersClientProps) {
    const { bookings, isLoading, error, refresh, updateBookingStatus } = useCustomerDashboard({
        initialBookings,
        initialProfile: { id: userId } as any
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Reset loading state on mount to prevent stuck state from Next.js router cache
    useEffect(() => {
        setUpdatingId(null)
    }, [])

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              booking.service_type.replace('_', ' ').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Gagal memuat pesanan: {error.message}</p>
                <Button onClick={() => refresh(false)} variant="outline" size="sm" className="mt-2">Coba Lagi</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h1>
                    <p className="text-gray-500 mt-1">Lacak dan lihat semua pesanan laundry Anda</p>
                </div>
                <Link href="/customer/orders/new">
                    <Button>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Pesan Baru
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari kode pesanan atau layanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Memuat pesanan...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">Tidak ada pesanan</p>
                            <p>Belum ada pesanan yang sesuai dengan filter Anda.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => {
                                const statusConfig = BOOKING_STATUS_CONFIG[booking.status]
                                const isFinished = ['finished', 'picked_up'].includes(booking.status)
                                const isPaid = (booking.payment || []).some((p: any) => p.status === 'paid')
                                const hasPending = (booking.payment || []).some((p: any) => p.status === 'pending')

                                return (
                                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div className="flex gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${isFinished ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 capitalize">
                                                        {booking.service_type.replace('_', ' ')}
                                                    </h3>
                                                    <span className="text-sm font-medium text-gray-500">#{booking.booking_code}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(booking.created_at)} • {booking.weight_kg ? `${booking.weight_kg} kg` : 'Berat belum ditimbang'}
                                                </p>
                                                <div className="mt-3 flex gap-2">
                                                    <Link href={`/customer/track/${booking.id}`}>
                                                        <Button variant="outline" size="sm">Lacak Pesanan</Button>
                                                    </Link>
                                                    {booking.service_type === 'self_service' && ['pending', 'washing', 'ironing'].includes(booking.status) && (
                                                        isPaid ? (
                                                            booking.status === 'pending' ? (
                                                                <Button 
                                                                    variant="primary" 
                                                                    size="sm" 
                                                                    isLoading={updatingId === booking.id}
                                                                    onClick={async () => {
                                                                        setUpdatingId(booking.id)
                                                                        await updateBookingStatus(booking.id, 'washing')
                                                                        setUpdatingId(null)
                                                                    }}
                                                                >
                                                                    Mulai Mencuci
                                                                </Button>
                                                            ) : booking.status === 'washing' ? (
                                                                <Button 
                                                                    variant="warning" 
                                                                    size="sm" 
                                                                    isLoading={updatingId === booking.id}
                                                                    onClick={async () => {
                                                                        setUpdatingId(booking.id)
                                                                        await updateBookingStatus(booking.id, 'ironing')
                                                                        setUpdatingId(null)
                                                                    }}
                                                                >
                                                                    Mulai Menyetrika
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    variant="success" 
                                                                    size="sm" 
                                                                    isLoading={updatingId === booking.id}
                                                                    onClick={async () => {
                                                                        setUpdatingId(booking.id)
                                                                        await updateBookingStatus(booking.id, 'finished')
                                                                        setUpdatingId(null)
                                                                    }}
                                                                >
                                                                    Selesai
                                                                </Button>
                                                            )
                                                        ) : (
                                                            !hasPending && (
                                                                <Link href={`/customer/payments/${booking.id}`}>
                                                                    <Button variant="danger" size="sm">
                                                                        Bayar Sekarang
                                                                    </Button>
                                                                </Link>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto flex sm:block justify-between items-start sm:items-end border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                            <div className="mb-2 sm:mb-3">
                                                <p className="text-sm text-gray-500 mb-1">Total Biaya</p>
                                                <p className="font-bold text-lg text-gray-900">
                                                    {formatCurrency(Number(booking.total_amount))}
                                                </p>
                                            </div>
                                            
                                            {(() => {
                                                const paymentArray = booking.payment || []
                                                const paidPayment = paymentArray.find((p: any) => p.status === 'paid')
                                                const pendingPayment = paymentArray.find((p: any) => p.status === 'pending')
                                                const failedPayment = paymentArray.find((p: any) => p.status === 'failed')

                                                let paymentLabel = 'Belum Bayar'
                                                let paymentVariant: 'danger' | 'warning' | 'success' | 'default' = 'danger'
                                                let paymentCodeToShow = null

                                                if (paidPayment) {
                                                    paymentLabel = 'Lunas'
                                                    paymentVariant = 'success'
                                                } else if (pendingPayment) {
                                                    paymentVariant = 'warning'
                                                    if (pendingPayment.method === 'cash' && pendingPayment.payment_code) {
                                                        paymentLabel = 'Bayar di Tempat'
                                                        paymentCodeToShow = pendingPayment.payment_code
                                                    } else {
                                                        paymentLabel = 'Menunggu Verifikasi'
                                                    }
                                                } else if (failedPayment) {
                                                    paymentLabel = 'Pembayaran Gagal'
                                                    paymentVariant = 'danger'
                                                }

                                                return (
                                                    <div className="flex flex-col gap-3 mt-0 items-end text-right w-full sm:w-auto">
                                                        <div className="flex flex-col items-end w-full">
                                                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Status Pesanan</span>
                                                            <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']}>
                                                                {statusConfig?.label || booking.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-col items-end w-full">
                                                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Status Pembayaran</span>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <Badge variant={paymentVariant}>
                                                                    {paymentLabel}
                                                                </Badge>
                                                                {paymentCodeToShow && (
                                                                    <span className="text-xs font-mono font-bold bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded select-all mt-1">
                                                                        {paymentCodeToShow}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
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
