import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/supabase/database-types'
import { createServerSupabase } from '@/lib/supabase/server'
import { OwnerReportsClient } from './owner-reports-client'

export const dynamic = 'force-dynamic'

export default async function OwnerReportsPage() {
    const supabase = await createServerSupabase()

    // 1. Fetch current month's aggregate stats
    const [
        { count: totalBookings },
        { count: activeBookings },
        paymentsResult,
        completedBookingsResult,
    ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(finished,picked_up,cancelled)'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('bookings').select('total_amount').in('status', ['finished', 'picked_up']),
    ])

    const payments = paymentsResult.data as { amount: number }[] | null
    const completedBookings = completedBookingsResult.data as { total_amount: number }[] | null
    
    let totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    if (totalRevenue === 0 && completedBookings) {
        totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0)
    }

    const stats = {
        totalBookings: totalBookings || 0,
        activeBookings: activeBookings || 0,
        totalRevenue,
    }

    // 2. Fetch past 30 days of data for the chart & service distribution
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
        { data: chartBookings },
        { data: machineBookings }
    ] = await Promise.all([
        supabase
            .from('bookings')
            .select('created_at, total_amount, status, service_type')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true }),
        supabase
            .from('machine_bookings')
            .select('machine_id, machines(machine_number, machine_type)')
            .gte('start_time', thirtyDaysAgo.toISOString())
    ])

    // Aggregate by date (DD MMM) for Revenue Chart
    const dailyDataMap = new Map<string, { revenue: number, orders: number }>()
    // Aggregate Service Types
    const serviceTypeMap = new Map<string, number>()
    // Aggregate Today's Status
    const todayStatusMap = { pending: 0, processing: 0, completed: 0 }

    if (chartBookings) {
        chartBookings.forEach(booking => {
            const date = new Date(booking.created_at)
            const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            
            // Daily Revenue
            const existing = dailyDataMap.get(dateStr) || { revenue: 0, orders: 0 }
            existing.orders += 1
            if (booking.status === 'finished' || booking.status === 'picked_up') {
                existing.revenue += Number(booking.total_amount)
            }
            dailyDataMap.set(dateStr, existing)

            // Service Type
            const sType = booking.service_type || 'regular'
            serviceTypeMap.set(sType, (serviceTypeMap.get(sType) || 0) + 1)

            // Today's Status
            if (date >= todayStart) {
                if (booking.status === 'pending') todayStatusMap.pending += 1
                else if (['finished', 'picked_up'].includes(booking.status)) todayStatusMap.completed += 1
                else todayStatusMap.processing += 1
            }
        })
    }

    const chartData = Array.from(dailyDataMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
    }))

    const serviceLabels: Record<string, string> = {
        'self_service': 'Self Service',
        'regular': 'Reguler',
        'express': 'Kilat',
        'iron_only': 'Setrika Saja'
    }

    const serviceData = Array.from(serviceTypeMap.entries()).map(([type, count]) => ({
        name: serviceLabels[type] || type,
        value: count
    }))

    // Aggregate Machine Utilization
    const machineMap = new Map<string, { name: string, count: number }>()
    if (machineBookings) {
        machineBookings.forEach((mb: any) => {
            if (mb.machines) {
                const existing = machineMap.get(mb.machine_id) || { name: mb.machines.machine_number, count: 0 }
                existing.count += 1
                machineMap.set(mb.machine_id, existing)
            }
        })
    }
    const machineData = Array.from(machineMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 machines

    // Update stats with today's breakdown
    const enrichedStats = {
        ...stats,
        todayStatus: todayStatusMap
    }

    return <OwnerReportsClient 
        stats={enrichedStats} 
        chartData={chartData} 
        serviceData={serviceData} 
        machineData={machineData} 
    />
}
