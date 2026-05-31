'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { updateBookingStatusAction } from '@/app/actions/employee'
import {
    BOOKING_STATUS_CONFIG,
    formatCurrency,
    formatDate,
} from '@/lib/supabase/database-types'
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

// Define the allowed status progression for employees
const STATUS_FLOW: BookingStatus[] = ['pending', 'washing', 'ironing', 'finished', 'picked_up']

function getNextStatus(current: BookingStatus, serviceType: string): BookingStatus | null {
    if (serviceType === 'self_service') {
        if (current === 'washing') return 'finished'
        return null
    }
    const idx = STATUS_FLOW.indexOf(current)
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null
    return STATUS_FLOW[idx + 1]
}

function getNextStatusLabel(current: BookingStatus, serviceType: string): string | null {
    const next = getNextStatus(current, serviceType)
    if (!next) return null
    return BOOKING_STATUS_CONFIG[next]?.label || next
}

export function EmployeeDashboardClient({ 
    profile, 
    todayBookings, 
    assignedBookings, 
    stats 
}: any) {
    const router = useRouter()
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Reset loading state on mount to prevent stuck state from Next.js router cache
    useEffect(() => {
        setUpdatingId(null)
    }, [])

    const handleUpdateStatus = async (bookingId: string, currentStatus: BookingStatus, serviceType: string) => {
        const nextStatus = getNextStatus(currentStatus, serviceType)
        if (!nextStatus) return

        setUpdatingId(bookingId)
        try {
            if (profile?.id) {
                await updateBookingStatusAction(bookingId, nextStatus, profile.id)
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to update status', err)
            alert('Gagal mengupdate status pesanan')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            {profile && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Halo, {profile.full_name} 👋
                    </h2>
                    <p className="text-gray-500">Selamat bekerja di LaundryKu</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Antrean Hari Ini"
                    value={String(stats.todayQueue)}
                    subtitle="pesanan aktif"
                    variant="blue"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pesanan Selesai"
                    value={String(stats.completedToday)}
                    subtitle="hari ini"
                    variant="green"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Siap Diambil"
                    value={String(stats.readyToPickup)}
                    subtitle="pesanan"
                    variant="yellow"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Ditugaskan"
                    value={String(stats.totalAssigned)}
                    subtitle="pesanan aktif"
                    variant="purple"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Queue */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Antrean Hari Ini</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {todayBookings.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p>Belum ada pesanan hari ini</p>
                                    </div>
                                ) : (
                                    todayBookings.map((booking: any, index: number) => {
                                        const statusConfig = BOOKING_STATUS_CONFIG[booking.status as keyof typeof BOOKING_STATUS_CONFIG]
                                        const nextLabel = getNextStatusLabel(booking.status, booking.service_type)
                                        const isUpdating = updatingId === booking.id

                                        return (
                                            <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 sm:mt-0 ${index === 0 ? 'bg-blue-100 text-blue-600 ' : 'bg-gray-100 text-gray-600 '
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5 sm:mb-0">
                                                            <span className="font-medium text-gray-900">
                                                                {booking.customer?.full_name || 'Unknown'}
                                                            </span>
                                                            <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']} size="sm" className="sm:hidden">
                                                                {statusConfig?.label || booking.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            {booking.booking_code} • {booking.service_type.replace('_', ' ')} • {booking.weight_kg || '?'}kg
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0 w-full sm:w-auto mt-2 sm:mt-0 border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
                                                    <div className="text-left sm:text-right flex items-center sm:block gap-2">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {formatCurrency(Number(booking.total_amount))}
                                                        </p>
                                                        <div className="hidden sm:block mt-1">
                                                            <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']} size="sm">
                                                                {statusConfig?.label || booking.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {nextLabel && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(booking.id, booking.status, booking.service_type)}
                                                            disabled={isUpdating}
                                                            className="shrink-0"
                                                        >
                                                            {nextLabel}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Shift Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Info Shift</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-600 font-medium">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <span className="block text-2xl font-bold text-gray-900 mt-1">
                                    {`${stats.todayQueue} Pesanan Aktif`}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-green-600">
                                        {stats.completedToday}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Selesai</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-yellow-600">
                                        {stats.readyToPickup}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Siap Ambil</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Bookings Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pesanan Ditugaskan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedBookings.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-sm">Belum ada pesanan ditugaskan</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {assignedBookings.slice(0, 5).map((booking: any) => {
                                        const statusConfig = BOOKING_STATUS_CONFIG[booking.status as keyof typeof BOOKING_STATUS_CONFIG]
                                        return (
                                            <div
                                                key={booking.id}
                                                className="p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm text-gray-900">
                                                        {booking.booking_code}
                                                    </span>
                                                    <Badge
                                                        variant={badgeVariantMap[statusConfig?.variant || 'default']}
                                                        size="sm"
                                                    >
                                                        {statusConfig?.label || booking.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {booking.customer?.full_name || 'Unknown'} • {formatDate(booking.created_at)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
