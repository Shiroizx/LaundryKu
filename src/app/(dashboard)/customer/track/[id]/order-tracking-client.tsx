'use client'

import { use } from 'react'
import Link from 'next/link'
import { useBookingTracking } from '@/hooks/use-customer-dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BOOKING_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/supabase/database-types'
import { QRCodeSVG } from 'qrcode.react'
import type { Booking, Payment } from '@/lib/supabase/database-types'

type BookingWithPayment = Booking & { payment?: Payment[] }

const STATUS_STEPS = ['pending', 'washing', 'ironing', 'finished'] as const

function getProgress(status: string): number {
    const stepIndex = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number])
    if (stepIndex === -1) {
        if (status === 'picked_up') return 100
        if (status === 'cancelled') return 0
        return 0
    }
    return ((stepIndex + 1) / STATUS_STEPS.length) * 100
}

function getCurrentStepIndex(status: string): number {
    const stepIndex = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number])
    if (stepIndex === -1 && status === 'picked_up') return STATUS_STEPS.length - 1
    return stepIndex >= 0 ? stepIndex : -1
}

interface OrderTrackingClientProps {
    bookingId: string
    initialBooking: BookingWithPayment | null
}

export function OrderTrackingClient({ bookingId, initialBooking }: OrderTrackingClientProps) {
    const { booking, isLoading } = useBookingTracking(bookingId, initialBooking)

    if (isLoading) {
        return null
    }

    if (!booking) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Pesanan Tidak Ditemukan</h2>
                <p className="text-gray-500 mt-2">Maaf, kami tidak dapat menemukan pesanan yang Anda cari.</p>
                <Link href="/customer/orders" className="mt-6 inline-block">
                    <Button>Kembali ke Riwayat</Button>
                </Link>
            </div>
        )
    }

    const statusConfig = BOOKING_STATUS_CONFIG[booking.status]
    const progress = getProgress(booking.status)
    const currentStepIndex = getCurrentStepIndex(booking.status)
    
    // Type casting for badge variant to satisfy TS
    const badgeVariant = (statusConfig?.variant || 'default') as 'default' | 'warning' | 'info' | 'purple' | 'cyan' | 'orange' | 'indigo' | 'success' | 'emerald' | 'danger'

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/customer/orders">
                    <Button variant="outline" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
                    <p className="text-sm text-gray-500">Kode: {booking.booking_code}</p>
                </div>
            </div>

            {/* Tracking Card */}
            <Card className="border-2 border-blue-100 overflow-hidden shadow-lg">
                <div className={`h-3 ${booking.status === 'finished' || booking.status === 'picked_up' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <Badge variant={badgeVariant} className="mb-2 text-sm px-3 py-1 animate-pulse">
                                {statusConfig?.label || booking.status}
                            </Badge>
                            <h2 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                                {booking.service_type.replace('_', ' ')}
                            </h2>
                        </div>
                        <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-sm font-medium text-gray-500">Total Biaya</p>
                            <p className="text-3xl font-bold text-blue-600 tracking-tight">
                                {formatCurrency(Number(booking.total_amount))}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar Area */}
                    <div className="py-6 mb-6 relative">
                        {booking.status === 'cancelled' ? (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center font-medium">
                                Pesanan ini telah dibatalkan.
                            </div>
                        ) : (
                            <>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-8 shadow-inner border border-gray-200">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-in-out relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                                
                                <div className="flex justify-between relative px-2">
                                    {STATUS_STEPS.map((step, index) => {
                                        const config = BOOKING_STATUS_CONFIG[step]
                                        const isCompleted = index <= currentStepIndex
                                        const isCurrent = index === currentStepIndex
                                        
                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10 w-1/4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 shadow-sm ${
                                                    isCompleted 
                                                    ? 'bg-blue-600 text-white shadow-blue-200 scale-110' 
                                                    : 'bg-white text-gray-400 border-2 border-gray-200'
                                                } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                                    {isCompleted ? (
                                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <span className={`mt-3 text-xs md:text-sm font-medium text-center ${
                                                    isCurrent ? 'text-blue-600 font-bold' : 
                                                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg">Rincian Layanan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <dl className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <dt className="text-gray-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                    Berat Cucian
                                </dt>
                                <dd className="font-medium text-gray-900">
                                    {booking.weight_kg ? `${booking.weight_kg} kg` : 'Belum ditimbang'}
                                </dd>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <dt className="text-gray-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Layanan
                                </dt>
                                <dd className="font-medium text-gray-900 capitalize">
                                    {booking.service_type.replace('_', ' ')}
                                </dd>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <dt className="text-gray-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Tanggal Order
                                </dt>
                                <dd className="font-medium text-gray-900 text-right">
                                    {formatDate(booking.created_at)}
                                </dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-gray-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Estimasi Selesai
                                </dt>
                                <dd className="font-medium text-gray-900 text-right">
                                    {booking.pickup_time ? new Date(booking.pickup_time).toLocaleString('id-ID', {
                                        dateStyle: 'medium', timeStyle: 'short'
                                    }) : '-'}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Catatan Pelanggan</dt>
                                <dd className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                                    {booking.notes || 'Tidak ada catatan khusus.'}
                                </dd>
                            </div>
                            
                            {booking.employee ? (
                                <div className="mt-4 flex flex-col gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-0.5">Pegawai Bertugas</p>
                                            <p className="text-sm font-bold text-gray-900">{booking.employee.profile?.full_name || 'Pegawai'}</p>
                                        </div>
                                    </div>
                                    {booking.employee.profile?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 p-2 rounded-lg border border-blue-50">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <a href={`https://wa.me/${booking.employee.profile.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                                {booking.employee.profile.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Menunggu Pegawai</p>
                                        <p className="text-xs text-gray-500">Akan segera diproses oleh tim kami.</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Status Detailed Info */}
                            {(() => {
                                const paymentArray = booking.payment || []
                                const paidPayment = paymentArray.find((p: any) => p.status === 'paid')
                                const pendingPayment = paymentArray.find((p: any) => p.status === 'pending')
                                
                                if (paidPayment) {
                                    return (
                                        <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Pembayaran Lunas</p>
                                                    <p className="text-sm font-medium text-gray-900">Metode: <span className="uppercase">{paidPayment.method.replace('_', ' ')}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                } else if (pendingPayment) {
                                    const isCash = pendingPayment.method === 'cash'
                                    return (
                                        <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-0.5">Menunggu Pembayaran</p>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">Total tagihan: {formatCurrency(Number(booking.total_amount))}</p>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {isCash ? 'Silakan bayar tunai di kasir menggunakan kode pembayaran Anda.' : 'Silakan selesaikan pembayaran atau unggah bukti transfer.'}
                                                    </p>
                                                    {isCash && pendingPayment.payment_code && (
                                                        <div className="bg-amber-100/80 border border-amber-200 rounded-lg p-2 text-center mt-2 mb-3">
                                                            <p className="text-[10px] text-amber-700 uppercase tracking-wider font-bold mb-0.5">Kode Pembayaran</p>
                                                            <p className="text-lg font-mono font-black text-amber-900 select-all tracking-widest">{pendingPayment.payment_code}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Link href={`/customer/payments/${booking.id}`} className="block w-full">
                                                <Button variant="warning" className="w-full text-sm h-9">
                                                    {isCash ? 'Lihat Kode Pembayaran' : 'Bayar Sekarang'}
                                                </Button>
                                            </Link>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="mt-4 p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-0.5">Belum Bayar</p>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">Pesanan belum dibayar</p>
                                                    <p className="text-xs text-gray-600">Pesanan Anda mungkin tidak diproses sebelum pembayaran diselesaikan.</p>
                                                </div>
                                            </div>
                                            <Link href={`/customer/payments/${booking.id}`} className="block w-full">
                                                <Button variant="danger" className="w-full text-sm h-9">
                                                    Pilih Metode Pembayaran
                                                </Button>
                                            </Link>
                                        </div>
                                    )
                                }
                            })()}
                        </dl>
                    </CardContent>
                </Card>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mt-6">
                <Card className="max-w-sm w-full text-center">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg">Scan QR Code</CardTitle>
                        <p className="text-sm text-gray-500">Tunjukkan QR Code ini kepada Kasir / Pegawai</p>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <QRCodeSVG 
                                value={booking.booking_code} 
                                size={180}
                                level="H"
                                includeMargin={false}
                                fgColor="#111827"
                            />
                        </div>
                        <p className="mt-6 text-xl font-mono font-bold tracking-widest text-gray-900">
                            {booking.booking_code}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
