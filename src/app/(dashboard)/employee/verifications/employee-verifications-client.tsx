'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/supabase/database-types'
import { verifyPaymentAction } from '@/app/(dashboard)/owner/verifications/actions' // Reuse action
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function EmployeeVerificationsClient({ initialPayments }: { initialPayments: any[] }) {
    const router = useRouter()
    const [payments, setPayments] = useState(initialPayments)
    const [isProcessing, setIsProcessing] = useState<string | null>(null)

    useEffect(() => {
        setPayments(initialPayments)
    }, [initialPayments])

    useEffect(() => {
        const supabase = getSupabaseBrowserClient() as any;
        const channelId = `employee-verifications-${Math.random().toString(36).substring(2, 11)}`;
        
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                () => {
                    console.log('Payment changed, refreshing verifications list...');
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    const handleAction = async (id: string, action: 'paid' | 'failed') => {
        if (action === 'failed' && !confirm('Yakin ingin menolak pembayaran ini? Pelanggan harus mengunggah ulang bukti.')) {
            return
        }

        setIsProcessing(id)
        try {
            // Optimistic update
            setPayments(prev => prev.filter(p => p.id !== id))
            const res = await verifyPaymentAction(id, action)
            if (!res.success) {
                // Revert
                setPayments(initialPayments)
                throw new Error(res.error)
            }
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Gagal memproses verifikasi.')
        } finally {
            setIsProcessing(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
                <p className="text-gray-500 mt-1">Konfirmasi bukti transfer atau kode pembayaran kasir pelanggan.</p>
            </div>

            {payments.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">Tidak ada antrean</p>
                        <p>Semua pembayaran telah diverifikasi.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {payments.map(payment => (
                        <Card key={payment.id}>
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                {/* Detail Sisi Kiri */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">Order #{payment.booking?.booking_code}</h3>
                                                <Badge variant="warning">Menunggu Verifikasi</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm text-gray-500">Total Dibayar</p>
                                            <p className="font-bold text-xl text-blue-600">
                                                {formatCurrency(Number(payment.amount))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium mb-2 text-gray-700">
                                            Metode: {payment.method === 'cash' ? 'Bayar di Tempat (Kasir)' : 'Transfer Bank / QRIS'}
                                        </p>
                                        
                                        {payment.method === 'cash' && payment.payment_code && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Kode Pembayaran dari Pelanggan:</p>
                                                <p className="font-mono text-2xl font-bold tracking-widest">{payment.payment_code}</p>
                                            </div>
                                        )}
                                        
                                        {(payment.method === 'bank_transfer' || payment.method === 'e_wallet') && payment.proof_url && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Foto Bukti Transfer:</p>
                                                <a href={payment.proof_url} target="_blank" rel="noreferrer" className="block w-full max-w-xs border rounded overflow-hidden hover:opacity-90 transition-opacity">
                                                    <img src={payment.proof_url} alt="Bukti Transfer" className="w-full h-auto object-cover" />
                                                </a>
                                                <p className="text-xs text-gray-400 mt-2">Klik gambar untuk memperbesar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Aksi Sisi Kanan */}
                                <div className="p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center items-center gap-3 min-w-[200px]">
                                    <Button 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                        disabled={isProcessing === payment.id}
                                        onClick={() => handleAction(payment.id, 'paid')}
                                    >
                                        {isProcessing === payment.id ? 'Memproses...' : 'Terima (Sah)'}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                                        disabled={isProcessing === payment.id}
                                        onClick={() => handleAction(payment.id, 'failed')}
                                    >
                                        Tolak (Tidak Sah)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
