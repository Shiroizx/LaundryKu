'use client'

import Link from 'next/link'
import { StatCard, QuickAction } from '@/components/dashboard/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKING_STATUS_CONFIG, formatCurrency } from '@/lib/supabase/database-types'
import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

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

// Status steps for progress tracking
const STATUS_STEPS = ['pending', 'washing', 'ironing', 'finished'] as const

// Calculate progress based on status
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
    return stepIndex >= 0 ? stepIndex : -1
}

// Framer motion variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

export function CustomerDashboardClient({ 
    profile, 
    bookings, 
    activeBookings, 
    stats, 
    payments 
}: any) {
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Current active order
    const currentOrder = activeBookings[0]

    // Chart Data logic
    const chartData = useMemo(() => {
        if (!payments || payments.filter((p: any) => p.status === 'paid').length === 0) {
            return [
                { name: 'Jan', total: 45000 },
                { name: 'Feb', total: 85000 },
                { name: 'Mar', total: 30000 },
                { name: 'Apr', total: 125000 },
                { name: 'Mei', total: 75000 },
                { name: 'Jun', total: 185000 },
            ]
        }

        // Aggregate real data by month
        const monthly = payments.reduce((acc: any, curr: any) => {
            if (curr.status === 'paid') {
                const date = new Date(curr.created_at)
                const month = date.toLocaleString('id-ID', { month: 'short' })
                acc[month] = (acc[month] || 0) + Number(curr.amount)
            }
            return acc
        }, {})
        
        return Object.entries(monthly).map(([name, total]) => ({ name, total }))
    }, [payments])

    const customerName = profile?.full_name || 'Pelanggan'
    const progress = currentOrder ? getProgress(currentOrder.status) : 0
    const currentStepIndex = currentOrder ? getCurrentStepIndex(currentOrder.status) : -1

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Halo, {customerName}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Selamat datang kembali di LaundryKu</p>
                </div>
                <Link href="/customer/orders/new">
                    <Button className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25 border-0 rounded-xl px-6 h-11 transition-all duration-300 hover:scale-105">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Pesan Laundry
                    </Button>
                </Link>
            </motion.div>

            {/* Current Order - Featured */}
            <motion.div variants={itemVariants}>
                {currentOrder ? (
                    <Card className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-xl shadow-cyan-900/5 bg-white/80 backdrop-blur-xl group">
                        <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-teal-400" />
                        <CardContent className="p-6 sm:p-8 relative">
                            {/* Decorative background blur */}
                            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span className="text-xs font-bold text-cyan-700">Sedang Diproses</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-400">
                                            Order #{currentOrder.booking_code}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 mt-3 capitalize">
                                        {currentOrder.service_type.replace('_', ' ')}
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1">
                                        Estimasi selesai: <span className="text-slate-700">{currentOrder.pickup_time ? new Date(currentOrder.pickup_time).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Menunggu'}</span>
                                    </p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Tagihan</p>
                                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                        {formatCurrency(Number(currentOrder.total_amount))}
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-8 relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-500">Progress Pengerjaan</span>
                                    <span className="text-sm font-black text-cyan-600">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Timeline steps */}
                            <div className="mt-6 flex items-center justify-between relative z-10">
                                {STATUS_STEPS.map((step, index) => {
                                    const isCompleted = index < currentStepIndex
                                    const isCurrent = index === currentStepIndex

                                    return (
                                        <div key={step} className="flex items-center flex-1 last:flex-none">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300 ${
                                                    isCompleted || isCurrent
                                                        ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-cyan-500/30'
                                                        : 'bg-white border-2 border-slate-100 text-slate-300'
                                                }`}>
                                                    {isCompleted ? (
                                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                            </div>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <div className="flex-1 h-1 mx-2 sm:mx-4 rounded-full overflow-hidden bg-slate-100">
                                                    <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-teal-400' : 'bg-transparent'}`} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between mt-3 text-[11px] sm:text-xs font-bold text-slate-500 relative z-10 px-1 sm:px-2 uppercase tracking-wider">
                                <span>Menunggu</span>
                                <span>Mencuci</span>
                                <span>Menyetrika</span>
                                <span>Siap Ambil</span>
                            </div>

                            <div className="mt-8 flex gap-4 relative z-10">
                                <Link href={`/customer/orders/${currentOrder.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold shadow-sm transition-all hover:border-slate-300">
                                        <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Detail Pesanan
                                    </Button>
                                </Link>
                                <Link href={`/customer/track/${currentOrder.id}`} className="flex-1">
                                    <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-semibold transition-all hover:scale-[1.02]">
                                        <svg className="w-5 h-5 mr-2 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Lacak Langsung
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-2 border-dashed border-slate-200 rounded-3xl bg-white/40 backdrop-blur-sm">
                        <CardContent className="p-10 text-center">
                            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-cyan-50 flex items-center justify-center shadow-inner">
                                <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Belum ada pesanan aktif
                            </h3>
                            <p className="text-slate-500 mb-6 font-medium max-w-sm mx-auto">
                                Pakaian kotor menumpuk? Biar kami yang urus! Pesan layanan laundry sekarang juga.
                            </p>
                            <Link href="/customer/orders/new">
                                <Button className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white rounded-xl px-8 h-12 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 font-bold">
                                    Pesan Laundry Sekarang
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Quick Actions (Moved up for better UX) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Pesan Baru"
                    href="/customer/orders/new"
                    variant="cyan"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                />
                <QuickAction
                    title="Lacak Pesanan"
                    href={currentOrder ? `/customer/track/${currentOrder.id}` : "/customer/orders"}
                    variant="blue"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <QuickAction
                    title="Riwayat"
                    href="/customer/orders"
                    variant="purple"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <QuickAction
                    title="Profil"
                    href="/customer/profile"
                    variant="default"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                    title="Total Pesanan"
                    value={String(stats.totalOrders)}
                    subtitle="Semua waktu"
                    variant="blue"
                    icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Pengeluaran"
                    value={formatCurrency(stats.totalSpent)}
                    subtitle="Semua transaksi selesai"
                    variant="green"
                    icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Siap Diambil"
                    value={String(stats.readyToPickup)}
                    subtitle="Menunggu diambil"
                    variant="yellow"
                    icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders List */}
                <Card className="rounded-3xl border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-5">
                        <CardTitle className="text-lg font-bold text-slate-800">Riwayat Pesanan</CardTitle>
                        <Link href="/customer/orders" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                            Lihat Semua →
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        {bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <p className="text-slate-500 font-medium">Belum ada riwayat pesanan</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100/80">
                                {bookings.slice(0, 5).map((booking: any) => {
                                    const statusConfig = BOOKING_STATUS_CONFIG[booking.status as keyof typeof BOOKING_STATUS_CONFIG]

                                    return (
                                        <div key={booking.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                                                    booking.status === 'finished' ? 'bg-emerald-50 text-emerald-600' :
                                                    booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-cyan-50 text-cyan-600'
                                                }`}>
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 capitalize">
                                                        {booking.service_type.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                        {booking.booking_code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800">
                                                    {formatCurrency(Number(booking.total_amount))}
                                                </p>
                                                <div className="mt-1">
                                                    <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']} className="px-2 py-0.5 shadow-sm">
                                                        {statusConfig?.label || booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transactions Chart */}
                <Card className="rounded-3xl border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-5">
                        <CardTitle className="text-lg font-bold text-slate-800">Statistik Transaksi</CardTitle>
                        <div className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-lg">6 Bulan Terakhir</div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        {isMounted && chartData.length > 0 ? (
                            <div className="w-full h-[300px] min-h-[300px] min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            hide 
                                            domain={['dataMin - 10000', 'dataMax + 50000']} 
                                        />
                                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Total']}
                                            labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="total" 
                                            stroke="#06b6d4" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorTotal)" 
                                            activeDot={{ r: 6, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <Skeleton className="w-full h-full rounded-xl bg-slate-100" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
