'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/supabase/database-types'
import type { Booking, StorePaymentMethod, Payment } from '@/lib/supabase/database-types'
import { Modal } from '@/components/ui/modal'
import { submitPaymentProof } from './actions'

type BookingWithPayment = Booking & { payment?: Payment[] }

interface PaymentDetailClientProps {
    booking: BookingWithPayment
    paymentMethods: StorePaymentMethod[]
}

export function PaymentDetailClient({ booking, paymentMethods }: PaymentDetailClientProps) {
    const router = useRouter()
    
    // Form state
    const [selectedMethodId, setSelectedMethodId] = useState<string>('')
    const [proofFile, setProofFile] = useState<File | null>(null)

    // Modal success state
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [generatedCode, setGeneratedCode] = useState<string | null>(null)

    const [state, formAction, isPending] = useActionState(submitPaymentProof, null)

    useEffect(() => {
        if (state?.success) {
            if (state.payment_code) {
                setGeneratedCode(state.payment_code)
            } else {
                setGeneratedCode(null)
            }
            setShowSuccessModal(true)
        } else if (state?.error) {
            alert(state.error)
        }
    }, [state])

    const handleCloseSuccess = () => {
        setShowSuccessModal(false)
        router.push('/customer/payments')
        router.refresh()
    }

    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId)

    const paymentArray = booking.payment || []
    const hasPaid = paymentArray.some((p: any) => p.status === 'paid')
    const hasPending = paymentArray.some((p: any) => p.status === 'pending')

    if (hasPaid) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mt-12">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pembayaran Lunas</h2>
                    <p className="text-gray-500 mt-2">Pesanan #{booking.booking_code} sudah lunas. Anda bisa melanjutkan aktivitas pencucian Anda.</p>
                </div>
                <Button onClick={() => router.push('/customer/orders')} className="px-6">Kembali ke Pesanan Saya</Button>
            </div>
        )
    }

    if (hasPending) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mt-12">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Menunggu Verifikasi</h2>
                    <p className="text-gray-500 mt-2">Anda sudah mengirimkan bukti pembayaran untuk pesanan #{booking.booking_code}. Kasir kami sedang melakukan verifikasi data.</p>
                </div>
                <Button onClick={() => router.push('/customer/orders')} className="px-6">Kembali ke Pesanan Saya</Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div>
                <Button variant="ghost" onClick={() => router.push('/customer/payments')} className="mb-4 -ml-4">
                    ← Kembali
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Pilih Pembayaran</h1>
                <p className="text-gray-500 mt-1">Selesaikan pembayaran untuk pesanan #{booking.booking_code}</p>
            </div>

            <Card className="border-blue-100">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Total Tagihan</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(Number(booking.total_amount))}
                            </p>
                        </div>
                        <Badge variant="warning">Belum Lunas</Badge>
                    </div>
                </CardContent>
            </Card>

            <form suppressHydrationWarning action={formAction} className="space-y-6">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="booking_code" value={booking.booking_code} />
                <input type="hidden" name="amount" value={booking.total_amount} />
                <input type="hidden" name="selectedMethodId" value={selectedMethodId} />
                <input type="hidden" name="is_qris" value={selectedMethod?.is_qris ? 'true' : 'false'} />

                <Card>
                    <CardHeader>
                        <CardTitle>Metode Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Option: Bayar di Tempat */}
                        <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethodId === 'on_site' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <input 
                                    suppressHydrationWarning
                                    type="radio" 
                                    name="payment_method" 
                                    value="on_site"
                                    checked={selectedMethodId === 'on_site'}
                                    onChange={() => setSelectedMethodId('on_site')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">Bayar di Tempat (Kasir)</h4>
                                    <p className="text-sm text-gray-500">Dapatkan kode pembayaran dan tunjukkan ke kasir</p>
                                </div>
                            </div>
                        </label>

                        {/* Store Methods */}
                        {paymentMethods.map(m => (
                            <label key={m.id} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethodId === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            suppressHydrationWarning
                                            type="radio" 
                                            name="payment_method" 
                                            value={m.id}
                                            checked={selectedMethodId === m.id}
                                            onChange={() => setSelectedMethodId(m.id)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{m.bank_name}</h4>
                                                {m.is_qris && <Badge variant="success" className="text-[10px] px-1 py-0 h-4">QRIS</Badge>}
                                            </div>
                                            <p className="text-sm text-gray-500">{m.account_number} a.n {m.account_name}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white border rounded flex items-center justify-center font-bold text-xs text-gray-400">
                                        {m.is_qris ? 'QR' : m.bank_name.substring(0, 3)}
                                    </div>
                                </div>

                                {/* Detail expanded if selected */}
                                {selectedMethodId === m.id && (
                                    <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
                                        {m.is_qris && m.qris_image_url ? (
                                            <div className="text-center">
                                                <p className="text-sm mb-2 font-medium">Scan QR Code di bawah ini:</p>
                                                <img src={m.qris_image_url} alt="QRIS" className="mx-auto max-w-[200px] border rounded p-2 bg-white" />
                                            </div>
                                        ) : (
                                            <div className="bg-white p-3 rounded border">
                                                <p className="text-sm text-gray-500 mb-1">Transfer ke Rekening:</p>
                                                <p className="font-mono text-lg font-bold select-all">{m.account_number}</p>
                                                <p className="text-sm">a.n <strong>{m.account_name}</strong></p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Upload Bukti Transfer (Max 2MB)
                                            </label>
                                            <input 
                                                type="file" 
                                                name="proofFile"
                                                accept="image/*"
                                                onChange={e => setProofFile(e.target.files?.[0] || null)}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                                required={selectedMethodId === m.id}
                                            />
                                            {proofFile && proofFile.size > 2 * 1024 * 1024 && (
                                                <p className="text-red-500 text-xs mt-1">Ukuran file melebihi 2MB!</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </label>
                        ))}
                    </CardContent>
                </Card>

                <Button 
                    type="submit" 
                    className="w-full py-6 text-lg" 
                    disabled={!selectedMethodId || isPending || (proofFile && proofFile.size > 2 * 1024 * 1024 ? true : false)}
                >
                    {isPending ? 'Memproses...' : 'Kirim Bukti Pembayaran'}
                </Button>
            </form>

            <Modal
                isOpen={showSuccessModal}
                onClose={handleCloseSuccess}
                title="Status Pembayaran"
                size="sm"
            >
                <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {generatedCode ? 'Kode Pembayaran Berhasil Dibuat!' : 'Bukti Transfer Dikirim!'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {generatedCode 
                                ? 'Silakan tunjukkan kode pembayaran di bawah ini kepada kasir di outlet kami untuk menyelesaikan pembayaran.' 
                                : 'Pembayaran Anda sedang dalam proses verifikasi oleh kasir kami.'
                            }
                        </p>
                    </div>

                    {generatedCode && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Kode Pembayaran Anda</p>
                            <p className="text-3xl font-mono font-black text-blue-600 select-all tracking-wider">
                                {generatedCode}
                            </p>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 text-xs"
                                onClick={() => {
                                    if (navigator.clipboard && window.isSecureContext) {
                                        navigator.clipboard.writeText(generatedCode).then(() => {
                                            alert('Kode pembayaran disalin ke clipboard!');
                                        }).catch(err => {
                                            console.error('Clipboard API failed', err);
                                        });
                                    } else {
                                        // Fallback for non-secure contexts (e.g., local IP access)
                                        const textArea = document.createElement("textarea");
                                        textArea.value = generatedCode;
                                        textArea.style.position = "fixed";
                                        textArea.style.left = "-999999px";
                                        textArea.style.top = "-999999px";
                                        document.body.appendChild(textArea);
                                        textArea.focus();
                                        textArea.select();
                                        try {
                                            document.execCommand('copy');
                                            alert('Kode pembayaran disalin ke clipboard!');
                                        } catch (error) {
                                            console.error('Fallback copy failed', error);
                                            alert('Gagal menyalin kode. Silakan salin manual.');
                                        } finally {
                                            textArea.remove();
                                        }
                                    }
                                }}
                            >
                                Salin Kode
                            </Button>
                        </div>
                    )}

                    <Button onClick={handleCloseSuccess} className="w-full mt-4">
                        Selesai
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
