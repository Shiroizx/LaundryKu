'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatCurrency, formatDate } from '@/lib/supabase/database-types'

export function OwnerTransactionsClient({ transactions }: { transactions: any[] }) {
    const [selectedTrx, setSelectedTrx] = useState<any | null>(null)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
                <p className="text-gray-500 mt-1">Daftar riwayat pembayaran dari semua pesanan</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Belum ada riwayat transaksi.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {transactions.map(trx => (
                                <div key={trx.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 cursor-pointer" onClick={() => setSelectedTrx(trx)}>
                                    <div className="flex gap-3 sm:gap-4 items-start">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 flex items-center justify-center ${
                                            trx.status === 'paid' ? 'bg-green-100 text-green-600 ' : 'bg-yellow-100 text-yellow-600 '
                                        }`}>
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm sm:text-base break-all sm:break-normal">
                                                {trx.booking?.customer?.full_name || 'Pelanggan'} <span className="text-gray-400 font-normal mx-1">|</span> <span className="font-mono text-blue-600">#{trx.booking?.booking_code}</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                {formatDate(trx.paid_at || trx.created_at)} • <span className="capitalize">{trx.method?.replace('_', ' ')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0 w-full sm:w-auto">
                                        <div className="flex flex-col sm:items-end">
                                            <p className="font-bold text-base sm:text-lg text-gray-900">
                                                {formatCurrency(trx.amount)}
                                            </p>
                                            <Badge variant={trx.status === 'paid' ? 'success' : 'warning'} className="w-fit mt-1">
                                                {trx.status === 'paid' ? 'Lunas' : 'Tertunda'}
                                            </Badge>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTrx(trx) }}>
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal 
                isOpen={!!selectedTrx} 
                onClose={() => setSelectedTrx(null)} 
                title="Detail Transaksi"
            >
                {selectedTrx && (
                    <div className="space-y-6">
                        <div className="text-center pb-6 border-b border-gray-100">
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                                selectedTrx.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(selectedTrx.amount)}</h3>
                            <Badge variant={selectedTrx.status === 'paid' ? 'success' : 'warning'} className="text-sm">
                                {selectedTrx.status === 'paid' ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Kode Pesanan</p>
                                <p className="font-mono font-medium text-gray-900">{selectedTrx.booking?.booking_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Pelanggan</p>
                                <p className="font-medium text-gray-900">{selectedTrx.booking?.customer?.full_name || 'Pelanggan'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                                <p className="font-medium text-gray-900 capitalize">{selectedTrx.method?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tanggal & Waktu</p>
                                <p className="font-medium text-gray-900">{formatDate(selectedTrx.paid_at || selectedTrx.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                                <p className="font-mono text-xs text-gray-400 break-all">{selectedTrx.id}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                            <a href={`/owner/orders/${selectedTrx.booking_id}`} className="flex-1 block">
                                <Button className="w-full">Lihat Pesanan</Button>
                            </a>
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedTrx(null)}>Tutup</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
