'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { lookupOrderAction } from '@/app/(dashboard)/owner/scan/actions'
import { QRScanner } from '@/components/qr-scanner'

// Manual input form
function ManualInputForm({ onSubmit }: { onSubmit: (code: string) => void }) {
    const [code, setCode] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.trim()) {
            onSubmit(code.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Kode Pesanan"
                placeholder="Masukkan kode pesanan (mis: ORD-...)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Button type="submit" className="w-full" disabled={!code.trim()}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari Pesanan
            </Button>
        </form>
    )
}

// Order result display
interface ScannedOrder {
    id: string
    customer: string
    phone: string
    service: string
    status: string
    weight: number
    total: number
    createdAt: string
    notes?: string
}

function OrderResult({ order, onClose }: { order: ScannedOrder; onClose: () => void }) {
    const router = useRouter()
    
    const statusVariants: Record<string, 'warning' | 'info' | 'purple' | 'cyan' | 'success' | 'emerald'> = {
        pending: 'warning',
        confirmed: 'info',
        in_progress: 'purple',
        washing: 'cyan',
        ready: 'success',
        completed: 'emerald',
    }

    const statusLabels: Record<string, string> = {
        pending: 'Menunggu',
        confirmed: 'Dikonfirmasi',
        in_progress: 'Sedang Diproses',
        washing: 'Mencuci',
        ready: 'Siap Diambil',
        completed: 'Selesai',
    }

    return (
        <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                            <Badge variant={statusVariants[order.status] || 'default'}>
                                {statusLabels[order.status] || order.status}
                            </Badge>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pelanggan</span>
                                <span className="font-medium text-gray-900">{order.customer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Telepon</span>
                                <span className="font-medium text-gray-900">{order.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Layanan</span>
                                <span className="font-medium capitalize text-gray-900">{order.service?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Berat</span>
                                <span className="font-medium text-gray-900">{order.weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-lg text-blue-600">Rp {order.total.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tanggal</span>
                                <span className="font-medium text-gray-900">{order.createdAt}</span>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    <strong>Catatan:</strong> {order.notes}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={onClose}>
                                Scan Ulang
                            </Button>
                            <Button className="flex-1" onClick={() => {
                                if (['pending', 'washing', 'ironing'].includes(order.status)) {
                                    router.push('/employee/queue')
                                } else {
                                    router.push('/employee/orders')
                                }
                            }}>
                                Buka di {['pending', 'washing', 'ironing'].includes(order.status) ? 'Antrean' : 'Pesanan'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function EmployeeScanClient() {
    const [mode, setMode] = useState<'camera' | 'manual'>('manual')
    const [scannedOrder, setScannedOrder] = useState<ScannedOrder | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [scanHistory, setScanHistory] = useState<ScannedOrder[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const handleScan = useCallback(async (data: string) => {
        setError(null)
        setIsSearching(true)
        try {
            const res = await lookupOrderAction(data)
            if (res.success && res.data) {
                const dbOrder = res.data
                const customerData = Array.isArray(dbOrder.customer) ? dbOrder.customer[0] : dbOrder.customer;
                const order: ScannedOrder = {
                    id: dbOrder.id || dbOrder.booking_code,
                    customer: customerData?.full_name || 'Tanpa Nama',
                    phone: customerData?.phone || '-',
                    service: dbOrder.service_type || 'Unknown',
                    status: dbOrder.status || 'pending',
                    weight: dbOrder.weight_kg || 0,
                    total: dbOrder.total_amount || dbOrder.total_price || 0,
                    createdAt: new Date(dbOrder.created_at).toLocaleString('id-ID'),
                    notes: dbOrder.notes || '',
                }
                setScannedOrder(order)
                setScanHistory(prev => {
                    const filtered = prev.filter(o => o.id !== order.id)
                    return [order, ...filtered].slice(0, 5)
                })
            } else {
                setError('Pesanan tidak ditemukan. Pastikan kode yang diinput benar.')
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mencari pesanan.')
        } finally {
            setIsSearching(false)
        }
    }, [])

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
                    <p className="text-gray-500 mt-1">Pindai resi pelanggan untuk memproses pesanan</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setMode('manual')}
                        className={cn( 'px-4 py-2 text-sm font-medium rounded-md transition-colors', mode === 'manual' ? 'bg-white shadow-sm text-gray-900 ' : 'text-gray-600 hover:text-gray-900 ' )}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => setMode('camera')}
                        className={cn( 'px-4 py-2 text-sm font-medium rounded-md transition-colors', mode === 'camera' ? 'bg-white shadow-sm text-gray-900 ' : 'text-gray-600 hover:text-gray-900 ' )}
                    >
                        Kamera
                    </button>
                </div>
            </div>

            {error && (
                <Alert variant="danger" title="Error">
                    {error}
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scanner Section */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {mode === 'camera' ? 'Scan dengan Kamera' : 'Input Manual'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {scannedOrder ? (
                                <OrderResult order={scannedOrder} onClose={() => setScannedOrder(null)} />
                            ) : mode === 'camera' ? (
                                <QRScanner onResult={handleScan} />
                            ) : (
                                <ManualInputForm onSubmit={handleScan} />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Scans */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Scan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {scanHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Belum ada scan</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {scanHistory.map((order) => (
                                        <div
                                            key={order.id}
                                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => setScannedOrder(order)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-gray-900">{order.id}</span>
                                                <Badge
                                                    variant={order.status === 'ready' ? 'success' : order.status === 'in_progress' ? 'purple' : 'default'}
                                                    size="sm"
                                                >
                                                    {order.status === 'ready' ? 'Siap' : order.status === 'in_progress' ? 'Proses' : 'Lain'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{order.customer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
