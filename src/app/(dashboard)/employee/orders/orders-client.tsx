'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { BOOKING_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/supabase/database-types'
import type { BookingWithCustomer } from '@/hooks/use-employee-dashboard'
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

export function OrdersClient({ orders }: { orders: BookingWithCustomer[] }) {
    const [selectedOrder, setSelectedOrder] = useState<BookingWithCustomer | null>(null)

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Belum ada riwayat pesanan.
                            </div>
                        ) : (
                            orders.map((order) => {
                                const statusConfig = BOOKING_STATUS_CONFIG[order.status as BookingStatus]
                                return (
                                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {order.booking_code}
                                                </h3>
                                                <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']}>
                                                    {statusConfig?.label || order.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Pelanggan: <span className="font-medium text-gray-900">{order.customer?.full_name || 'Unknown'}</span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.service_type?.replace('_', ' ')} • {order.weight_kg}kg • Dibuat: {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left sm:text-right">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Total Biaya</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(order.total_amount)}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title="Detail Pesanan"
                description={selectedOrder ? `Kode: ${selectedOrder.booking_code}` : ''}
                size="md"
                footer={
                    <Button onClick={() => setSelectedOrder(null)}>Tutup</Button>
                }
            >
                {selectedOrder && (() => {
                    const statusConfig = BOOKING_STATUS_CONFIG[selectedOrder.status as BookingStatus]
                    return (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Pelanggan</p>
                                    <p className="font-semibold text-lg">{selectedOrder.customer?.full_name || 'Tanpa Nama'}</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer?.phone || '-'}</p>
                                </div>
                                <Badge variant={badgeVariantMap[statusConfig?.variant || 'default']} className="text-sm py-1 px-3">
                                    {statusConfig?.label || selectedOrder.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-2">
                                <div>
                                    <p className="text-sm text-gray-500">Layanan</p>
                                    <p className="font-medium capitalize">{selectedOrder.service_type?.replace('_', ' ') || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Berat</p>
                                    <p className="font-medium">{selectedOrder.weight_kg ? `${selectedOrder.weight_kg} Kg` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Harga</p>
                                    <p className="font-medium">{formatCurrency(selectedOrder.total_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan:</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )
                })()}
            </Modal>
        </>
    )
}
