'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { StorePaymentMethod } from '@/lib/supabase/database-types'
import { addPaymentMethodAction, deletePaymentMethodAction } from './actions'

export function PaymentMethodsSettings({ initialMethods }: { initialMethods: StorePaymentMethod[] }) {
    const [methods, setMethods] = useState<StorePaymentMethod[]>(initialMethods)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [bankName, setBankName] = useState('BCA')
    const [accountNumber, setAccountNumber] = useState('')
    const [accountName, setAccountName] = useState('')
    const [isQris, setIsQris] = useState(false)
    const [qrisFile, setQrisFile] = useState<File | null>(null)



    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const formData = new FormData()
            formData.append('bankName', bankName)
            formData.append('accountNumber', accountNumber)
            formData.append('accountName', accountName)
            formData.append('isQris', isQris.toString())
            if (isQris && qrisFile) {
                formData.append('qrisFile', qrisFile)
            }

            const res = await addPaymentMethodAction(formData)
            if (!res.success || !res.data) throw new Error(res.error)

            setMethods(prev => [res.data, ...prev])
            alert('Metode pembayaran berhasil ditambahkan!')
            setIsFormOpen(false)
            
            // Reset form
            setAccountNumber('')
            setAccountName('')
            setQrisFile(null)
            setIsQris(false)
        } catch (err) {
            console.error(err)
            alert('Gagal menyimpan metode pembayaran.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus metode pembayaran ini?')) return
        try {
            const res = await deletePaymentMethodAction(id)
            if (res.success) {
                setMethods(prev => prev.filter(m => m.id !== id))
            } else {
                throw new Error(res.error)
            }
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus metode pembayaran.')
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Metode Pembayaran</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsFormOpen(!isFormOpen)}>
                    {isFormOpen ? 'Tutup' : 'Tambah Baru'}
                </Button>
            </CardHeader>
            <CardContent>
                {isFormOpen && (
                    <form onSubmit={handleSave} className="mb-8 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                        <h3 className="font-bold mb-2">Tambah Metode Baru</h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <input 
                                type="checkbox" 
                                id="is_qris"
                                checked={isQris}
                                onChange={(e) => {
                                    setIsQris(e.target.checked)
                                    if(e.target.checked) setBankName('QRIS')
                                    else setBankName('BCA')
                                }}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="is_qris" className="text-sm font-medium">Ini adalah QRIS</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Bank / E-Wallet</label>
                                <Input 
                                    value={bankName} 
                                    onChange={e => setBankName(e.target.value)} 
                                    placeholder="Cth: BCA, Mandiri, Gopay..." 
                                    required 
                                    disabled={isQris}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nomor Rekening / HP</label>
                                <Input 
                                    value={accountNumber} 
                                    onChange={e => setAccountNumber(e.target.value)} 
                                    placeholder={isQris ? 'Opsional/NMID' : '1234567890'} 
                                    required={!isQris} 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Nama Pemilik (A.N)</label>
                                <Input 
                                    value={accountName} 
                                    onChange={e => setAccountName(e.target.value)} 
                                    placeholder="A.N John Doe" 
                                    required 
                                />
                            </div>
                            {isQris && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Upload Gambar QRIS</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setQrisFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <div className="pt-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Menyimpan...' : 'Simpan Metode'}
                            </Button>
                        </div>
                    </form>
                )}

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-16 bg-gray-100 rounded"></div>
                        <div className="h-16 bg-gray-100 rounded"></div>
                    </div>
                ) : methods.length === 0 ? (
                    <div className="text-center p-6 text-gray-500 border border-dashed rounded-lg">
                        Belum ada metode pembayaran yang diatur.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {methods.map(m => (
                            <div key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold">
                                        {m.is_qris ? 'QR' : m.bank_name.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold">{m.bank_name}</h4>
                                            {m.is_qris && <Badge variant="success">QRIS</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {m.account_number} • a.n {m.account_name}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(m.id)}>
                                    Hapus
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
