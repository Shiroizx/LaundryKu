'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardPage, DashboardSection } from '@/components/layout/dashboard-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKING_STATUS_CONFIG, formatCurrency } from '@/lib/supabase/database-types'
import { updateBookingStatusAction } from '@/app/actions/employee'
import type { BookingStatus } from '@/lib/supabase/database-types'

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

const STATUS_FLOW: BookingStatus[] = ['pending', 'washing', 'ironing', 'finished', 'picked_up']

function getNextStatus(current: BookingStatus): BookingStatus | null {
    const idx = STATUS_FLOW.indexOf(current)
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null
    return STATUS_FLOW[idx + 1]
}

function getNextStatusLabel(current: BookingStatus): string | null {
    const next = getNextStatus(current)
    if (!next) return null
    return BOOKING_STATUS_CONFIG[next]?.label || next
}

export function EmployeeQueueClient({ initialBookings, employeeId }: { initialBookings: any[], employeeId: string }) {
    const router = useRouter()
    const [bookings, setBookings] = useState(initialBookings)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const isLoading = false

    // Reset loading state on mount to prevent stuck state from Next.js router cache
    useEffect(() => {
        setUpdatingId(null)
    }, [])

    useEffect(() => {
        setBookings(initialBookings)
    }, [initialBookings])

    const refresh = () => {
        router.refresh()
    }

    const handleUpdateStatus = async (bookingId: string, currentStatus: BookingStatus) => {
        const nextStatus = getNextStatus(currentStatus)
        if (!nextStatus) return
        
        setUpdatingId(bookingId)
        try {
            // Optimistic update
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b))
            
            await updateBookingStatusAction(bookingId, nextStatus, employeeId)
            router.refresh()
        } catch (err) {
            console.error(err)
            setBookings(initialBookings)
            alert('Gagal mengubah status pesanan')
        } finally {
            setUpdatingId(null)
        }
    }

    const activeQueue = bookings.filter(b => !['finished', 'picked_up', 'cancelled'].includes(b.status))

    return (
        <DashboardPage>
            <DashboardSection title="Antrean Hari Ini" subtitle="Daftar pesanan aktif yang harus dikerjakan">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">Antrean Aktif</CardTitle>
                        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeQueue.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Tidak ada antrean pesanan hari ini.
                                </div>
                            ) : (
                                activeQueue.map((booking, idx) => {
                                    const statusConfig = BOOKING_STATUS_CONFIG[booking.status as BookingStatus]
                                    const nextStatusLabel = getNextStatusLabel(booking.status as BookingStatus)
                                    const isUpdating = updatingId === booking.id

                                    // Payment check logic
                                    const isPaid = booking.total_amount === 0 || booking.payments?.some((p: any) => p.status === 'paid')
                                    const isPending = booking.status === 'pending'
                                    const disableNextStatus = isUpdating || (isPending && !isPaid)

                                    return (
                                        <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mt-0.5 sm:mt-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5 sm:mb-0">
                                                        <p className="font-medium text-gray-900">
                                                            {booking.customer?.full_name || 'Unknown'}
                                                        </p>
                                                        <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']} className="sm:hidden text-[10px] px-1.5 py-0.5">
                                                            {statusConfig?.label || booking.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        {booking.booking_code} • {booking.service_type} • {booking.weight_kg}kg
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0 w-full sm:w-auto mt-2 sm:mt-0 border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
                                                <div className="text-left sm:text-right flex items-center sm:block gap-2">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(booking.total_amount)}
                                                    </p>
                                                    <div className="hidden sm:block mt-1">
                                                        <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']}>
                                                            {statusConfig?.label || booking.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {nextStatusLabel && (
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleUpdateStatus(booking.id, booking.status as BookingStatus)}
                                                            disabled={disableNextStatus}
                                                        >
                                                            {isUpdating ? '...' : nextStatusLabel}
                                                        </Button>
                                                        {isPending && !isPaid && (
                                                            <span className="text-[10px] text-red-500 font-medium whitespace-nowrap">Belum Lunas</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DashboardSection>
        </DashboardPage>
    )
}
