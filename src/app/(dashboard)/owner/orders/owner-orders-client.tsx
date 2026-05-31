'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKING_STATUS_CONFIG } from '@/lib/supabase/database-types'
import { updateOrderStatusAction } from './actions'

type BadgeVariant = NonNullable<BadgeProps['variant']>

const SERVICE_LABELS: Record<string, string> = {
    full_service: 'Cuci Lengkap',
    express: 'Cuci Kilat',
    self_service: 'Mandiri (Mesin)',
}

const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    ...Object.entries(BOOKING_STATUS_CONFIG).map(([key, config]) => ({
        value: key,
        label: config.label,
    })),
]

const serviceOptions = [
    { value: 'all', label: 'Semua Layanan' },
    { value: 'full_service', label: 'Cuci Lengkap' },
    { value: 'express', label: 'Cuci Kilat' },
    { value: 'self_service', label: 'Mandiri (Mesin)' },
]

export default function OwnerOrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const router = useRouter()
    const [orders, setOrders] = useState(initialOrders)
    const isLoading = false
    const error = null

    useEffect(() => {
        setOrders(initialOrders)
    }, [initialOrders])

    const refresh = () => {
        router.refresh()
    }

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [serviceFilter, setServiceFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer?.phone || '').includes(searchQuery)
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesService = serviceFilter === 'all' || order.service_type === serviceFilter
        return matchesSearch && matchesStatus && matchesService
    })

    const getStatusVariant = (status: string): BadgeVariant => {
        const config = BOOKING_STATUS_CONFIG[status as keyof typeof BOOKING_STATUS_CONFIG]
        if (!config) return 'default'
        
        // Map the custom variants to the supported BadgeVariants
        switch (config.variant) {
            case 'warning': return 'warning'
            case 'cyan': return 'cyan'
            case 'indigo': return 'indigo'
            case 'success': return 'success'
            case 'emerald': return 'emerald'
            case 'danger': return 'danger'
            default: return 'default'
        }
    }

    const openDetail = (order: typeof orders[0]) => {
        setSelectedOrder(order)
        setIsDetailOpen(true)
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedOrder) return
        setIsUpdating(true)
        try {
            // Optimistic update
            const oldStatus = selectedOrder.status
            setSelectedOrder({ ...selectedOrder, status: newStatus })
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
            
            const res = await updateOrderStatusAction(selectedOrder.id, newStatus)
            if (!res.success) {
                // Revert
                setSelectedOrder({ ...selectedOrder, status: oldStatus })
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: oldStatus } : o))
                throw new Error(res.error)
            }
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
    }



    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
                    <p className="text-gray-500 mt-1">Pantau dan kelola semua pesanan secara real-time</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Cari kode pesanan, nama, telp..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                options={serviceOptions}
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24 mb-2"/><Skeleton className="h-3 w-16"/></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-2"/><Skeleton className="h-3 w-24"/></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24 mb-2"/><Skeleton className="h-3 w-12"/></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full"/></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20"/></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-16"/></td>
                                    </tr>
                                )) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada pesanan yang sesuai filter
                                        </td>
                                    </tr>
                                ) : filteredOrders.map((order) => {
                                    const dateObj = new Date(order.created_at)
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-blue-600">{order.booking_code}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {dateObj.toLocaleDateString('id-ID')} {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{order.customer?.full_name || 'Tanpa Nama'}</div>
                                                <div className="text-sm text-gray-500 mt-1">{order.customer?.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{SERVICE_LABELS[order.service_type] || order.service_type}</div>
                                                <div className="text-sm text-gray-500 mt-1">{order.weight_kg ? `${order.weight_kg} kg` : '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusVariant(order.status)}>
                                                    {BOOKING_STATUS_CONFIG[order.status as keyof typeof BOOKING_STATUS_CONFIG]?.label || order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button variant="ghost" size="sm" onClick={() => openDetail(order)}>Detail</Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Detail Pesanan"
                description={selectedOrder?.booking_code}
                size="md"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status Progress */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900">Status Saat Ini</h3>
                                <Badge variant={getStatusVariant(selectedOrder.status)}>
                                    {BOOKING_STATUS_CONFIG[selectedOrder.status as keyof typeof BOOKING_STATUS_CONFIG]?.label || selectedOrder.status}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Select 
                                    options={Object.entries(BOOKING_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
                                    value={selectedOrder.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                />
                                {isUpdating && <div className="mt-2 text-sm text-blue-500">Menyimpan...</div>}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Pelanggan</p>
                                <p className="font-medium text-gray-900">{selectedOrder.customer?.full_name || '-'}</p>
                                <p className="text-sm text-gray-600">{selectedOrder.customer?.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Pegawai Ditugaskan</p>
                                <p className="font-medium text-gray-900">{selectedOrder.employee?.profile?.full_name || 'Belum ada'}</p>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Layanan</span>
                                    <span className="font-medium text-gray-900">{SERVICE_LABELS[selectedOrder.service_type] || selectedOrder.service_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Berat</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.weight_kg ? `${selectedOrder.weight_kg} kg` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Waktu Diambil</span>
                                    <span className="font-medium text-gray-900">
                                        {selectedOrder.pickup_time ? new Date(selectedOrder.pickup_time).toLocaleString('id-ID') : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-100">
                                    <span className="font-medium text-gray-900">Total Tagihan</span>
                                    <span className="font-bold text-blue-600">Rp {selectedOrder.total_amount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}