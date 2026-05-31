import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    BOOKING_STATUS_CONFIG,
    MACHINE_STATUS_CONFIG,
    MACHINE_TYPE_CONFIG,
    formatCurrency,
} from '@/lib/supabase/database-types'

// Badge variant mapping
const badgeVariantMap: Record<string, 'default' | 'warning' | 'info' | 'purple' | 'cyan' | 'orange' | 'indigo' | 'success' | 'emerald' | 'danger'> = {
    warning: 'warning',
    cyan: 'cyan',
    indigo: 'indigo',
    success: 'success',
    emerald: 'emerald',
    danger: 'danger',
    default: 'default',
}

export default async function OwnerDashboard() {
    const supabase = await createServerSupabase()

    // Fetch stats
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
        { count: totalBookings },
        { count: activeBookings },
        paymentsResult,
        completedBookingsResult,
        { count: machinesAvailable },
        { count: machinesTotal },
        { count: employeesActive },
    ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(finished,picked_up,cancelled)'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('bookings').select('total_amount').in('status', ['finished', 'picked_up']),
        supabase.from('machines').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('machines').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('is_active', true),
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
        machinesAvailable: machinesAvailable || 0,
        machinesTotal: machinesTotal || 0,
        employeesActive: employeesActive || 0,
    }

    // Fetch recent bookings
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            customer:profiles!user_id(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch machines
    const { data: machines } = await supabase
        .from('machines')
        .select('*')
        .order('machine_number', { ascending: true })

    // Fetch employees
    const { data: employees } = await supabase
        .from('employees')
        .select(`
            *,
            profile:profiles!user_id(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Pesanan"
                    value={String(stats.totalBookings)}
                    subtitle="Semua pesanan"
                    variant="blue"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pesanan Aktif"
                    value={String(stats.activeBookings)}
                    subtitle="Sedang diproses"
                    variant="purple"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pendapatan Keseluruhan"
                    value={formatCurrency(stats.totalRevenue)}
                    subtitle="Total"
                    variant="green"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Mesin Aktif"
                    value={`${stats.machinesAvailable}/${stats.machinesTotal}`}
                    subtitle={`${stats.employeesActive} karyawan aktif`}
                    variant="yellow"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pesanan Terbaru</CardTitle>
                            <Link href="/owner/orders">
                                <Button variant="ghost" size="sm">Lihat Semua</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {!recentBookings || recentBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    Tidak ada pesanan
                                                </td>
                                            </tr>
                                        ) : (
                                            recentBookings.map((booking) => {
                                                const statusConfig = BOOKING_STATUS_CONFIG[booking.status as keyof typeof BOOKING_STATUS_CONFIG]
                                                const customerName = booking.customer?.full_name || 'Unknown'

                                                return (
                                                    <tr key={booking.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                            {booking.booking_code}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {customerName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                            {booking.service_type.replace('_', ' ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']}>
                                                                {statusConfig?.label || booking.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(Number(booking.total_amount))}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <Link href={`/owner/orders/${booking.id}`}>
                                                                <Button variant="ghost" size="sm">Detail</Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Machine Status */}
                <div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Status Mesin</CardTitle>
                            <Link href="/owner/machines">
                                <Button variant="ghost" size="sm">Kelola</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!machines || machines.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">
                                    Tidak ada mesin
                                </p>
                            ) : (
                                machines.slice(0, 6).map((machine) => {
                                    const statusConfig = MACHINE_STATUS_CONFIG[machine.status as keyof typeof MACHINE_STATUS_CONFIG]
                                    const typeConfig = MACHINE_TYPE_CONFIG[machine.machine_type as keyof typeof MACHINE_TYPE_CONFIG]

                                    return (
                                        <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${machine.status === 'available' ? 'bg-green-100 text-green-600 ' :
                                                        machine.status === 'in_use' ? 'bg-yellow-100 text-yellow-600 ' :
                                                            'bg-orange-100 text-orange-600 '
                                                    }`}>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {machine.machine_number}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {typeConfig?.label || machine.machine_type}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']}>
                                                {statusConfig?.label || machine.status}
                                            </Badge>
                                        </div>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Employees Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Karyawan Aktif</CardTitle>
                        <Link href="/owner/employees">
                            <Button variant="ghost" size="sm">Lihat Semua</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200">
                            {!employees || employees.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Tidak ada karyawan
                                </p>
                            ) : (
                                employees.slice(0, 5).map((employee) => (
                                    <div key={employee.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-medium">
                                                    {employee.profile?.full_name?.charAt(0) || employee.employee_code.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {employee.profile?.full_name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {employee.position} • {employee.shift || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={employee.is_active ? 'success' : 'danger'}>
                                            {employee.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Cepat</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Total Karyawan</p>
                                <span className="block text-2xl font-bold text-gray-900">
                                    {employees?.length || 0}
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Mesin Total</p>
                                <span className="block text-2xl font-bold text-gray-900">
                                    {machines?.length || 0}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <p className="text-sm text-gray-600">Pesanan Aktif</p>
                            <span className="block text-2xl font-bold text-blue-600">
                                {stats.activeBookings}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/owner/orders/new">
                    <Button variant="outline" className="h-20 w-full flex-col gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm">Pesanan Baru</span>
                    </Button>
                </Link>
                <Link href="/owner/employees/new">
                    <Button variant="outline" className="h-20 w-full flex-col gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">Tambah Karyawan</span>
                    </Button>
                </Link>
                <Link href="/owner/machines">
                    <Button variant="outline" className="h-20 w-full flex-col gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className="text-sm">Kelola Mesin</span>
                    </Button>
                </Link>
                <Link href="/owner/reports">
                    <Button variant="outline" className="h-20 w-full flex-col gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">Lihat Laporan</span>
                    </Button>
                </Link>
            </div>
        </div>
    )
}