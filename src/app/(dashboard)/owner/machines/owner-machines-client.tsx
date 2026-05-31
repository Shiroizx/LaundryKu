'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { addMachineAction, updateMachineAction, deleteMachineAction } from './actions'

const TYPE_OPTIONS = [
    { value: 'washing_machine', label: 'Mesin Cuci' },
    { value: 'dryer', label: 'Mesin Pengering' },
    { value: 'iron', label: 'Setrika' },
]
const TYPE_LABELS: Record<string, string> = { washing_machine: 'Mesin Cuci', dryer: 'Mesin Pengering', iron: 'Setrika' }
const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'orange'; bg: string }> = {
    available: { label: 'Tersedia', variant: 'success', bg: 'bg-green-500' },
    in_use: { label: 'Digunakan', variant: 'warning', bg: 'bg-yellow-500' },
    maintenance: { label: 'Perawatan', variant: 'orange', bg: 'bg-orange-500' },
}

export default function OwnerMachinesClient({ initialMachines }: { initialMachines: any[] }) {
    const router = useRouter()
    const [machines, setMachines] = useState(initialMachines)
    const isLoading = false
    const error = null

    useEffect(() => {
        setMachines(initialMachines)
    }, [initialMachines])

    const refresh = (showLoader = false) => {
        router.refresh()
    }

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedMachine, setSelectedMachine] = useState<typeof machines[0] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const [addForm, setAddForm] = useState({ machine_number: '', machine_type: 'washing_machine', brand: '', capacity_kg: '', price_per_kg: '5000' })
    const [editForm, setEditForm] = useState({ machine_number: '', machine_type: '', brand: '', capacity_kg: '', price_per_kg: '', status: '' })

    const filtered = machines.filter(m => {
        return (filterType === 'all' || m.machine_type === filterType) && (filterStatus === 'all' || m.status === filterStatus)
    })

    const stats = {
        total: machines.length,
        available: machines.filter(m => m.status === 'available').length,
        inUse: machines.filter(m => m.status === 'in_use').length,
        maintenance: machines.filter(m => m.status === 'maintenance').length,
    }

    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const handleUpdateStatus = async (id: string, status: string) => {
        setUpdatingId(id)
        try {
            setMachines(prev => prev.map(m => m.id === id ? { ...m, status } : m))
            const res = await updateMachineAction(id, { status: status as any })
            if (!res.success) {
                setMachines(prev => prev.map(m => m.id === id ? { ...m, status: initialMachines.find(im => im.id === id)?.status || m.status } : m))
                throw new Error(res.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleAdd = async () => {
        setFormError(null)
        if (!addForm.machine_number || !addForm.machine_type) { setFormError('Nomor mesin dan tipe harus diisi'); return }
        setIsSubmitting(true)
        try {
            const res = await addMachineAction({
                machine_number: addForm.machine_number,
                machine_type: addForm.machine_type as any,
                brand: addForm.brand || null,
                capacity_kg: addForm.capacity_kg ? parseFloat(addForm.capacity_kg) : null,
                price_per_kg: addForm.price_per_kg ? parseFloat(addForm.price_per_kg) : 5000,
            })
            if (!res.success) throw new Error(res.error)
            
            setShowAddModal(false)
            setAddForm({ machine_number: '', machine_type: 'washing_machine', brand: '', capacity_kg: '', price_per_kg: '5000' })
            router.refresh()
        } catch (err) { setFormError(err instanceof Error ? err.message : 'Gagal menambah mesin') }
        finally { setIsSubmitting(false) }
    }

    const handleEditOpen = (m: typeof machines[0]) => {
        setSelectedMachine(m)
        setEditForm({ machine_number: m.machine_number, machine_type: m.machine_type, brand: m.brand || '', capacity_kg: String(m.capacity_kg || ''), price_per_kg: String(m.price_per_kg || 5000), status: m.status })
        setFormError(null)
        setShowEditModal(true)
    }

    const handleEdit = async () => {
        if (!selectedMachine) return
        setFormError(null)
        setIsSubmitting(true)
        try {
            const res = await updateMachineAction(selectedMachine.id, {
                machine_number: editForm.machine_number,
                machine_type: editForm.machine_type as any,
                brand: editForm.brand || null,
                capacity_kg: editForm.capacity_kg ? parseFloat(editForm.capacity_kg) : null,
                price_per_kg: editForm.price_per_kg ? parseFloat(editForm.price_per_kg) : 5000,
                status: editForm.status as any,
            })
            if (!res.success) throw new Error(res.error)
            
            setShowEditModal(false)
            router.refresh()
        } catch (err) { setFormError(err instanceof Error ? err.message : 'Gagal update mesin') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!selectedMachine) return
        setIsSubmitting(true)
        try {
            const res = await deleteMachineAction(selectedMachine.id)
            if (res.success) {
                setMachines(prev => prev.filter(m => m.id !== selectedMachine.id))
                setShowDeleteDialog(false)
            } else {
                throw new Error(res.error)
            }
        }
        catch (err) { console.error(err) }
        finally { setIsSubmitting(false) }
    }



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Mesin</h1>
                    <p className="text-gray-500 mt-1">Monitor dan kelola mesin laundry</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refresh(true)}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </Button>
                    <Button onClick={() => { setFormError(null); setAddForm({ machine_number: '', machine_type: 'washing_machine', brand: '', capacity_kg: '', price_per_kg: '5000' }); setShowAddModal(true) }}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Mesin
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Mesin', value: stats.total, color: 'blue' },
                    { label: 'Tersedia', value: stats.available, color: 'green' },
                    { label: 'Digunakan', value: stats.inUse, color: 'yellow' },
                    { label: 'Perawatan', value: stats.maintenance, color: 'orange' },
                ].map((s) => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">{s.label}</p>
                            <span className={`block text-2xl font-bold text-${s.color}-600`}>
                                {isLoading ? <Skeleton className="h-7 w-12" /> : s.value}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters + View Toggle */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-auto h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">Semua Tipe</option>
                                <option value="washing_machine">Mesin Cuci</option>
                                <option value="dryer">Mesin Pengering</option>
                                <option value="iron">Setrika</option>
                            </select>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">Semua Status</option>
                                <option value="available">Tersedia</option>
                                <option value="in_use">Digunakan</option>
                                <option value="maintenance">Perawatan</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg self-end sm:self-auto">
                            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200 ')}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200 ')}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Machine Cards / Table */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? [...Array(4)].map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
                    )) : filtered.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-gray-500">Tidak ada mesin ditemukan</div>
                    ) : filtered.map((m) => {
                        const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.available
                        return (
                            <Card key={m.id} className="overflow-hidden">
                                <div className={cn('h-1.5', sc.bg)} />
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <Badge variant={sc.variant}>{sc.label}</Badge>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-gray-900">{m.machine_number}</h3>
                                        <p className="text-sm text-gray-500">{TYPE_LABELS[m.machine_type] || m.machine_type} • {m.capacity_kg ? `${m.capacity_kg}kg` : '-'}</p>
                                        <p className="text-sm font-bold text-blue-600 mt-0.5">Rp {m.price_per_kg?.toLocaleString('id-ID')}/kg</p>
                                        {m.brand && <p className="text-xs text-gray-400 mt-1">{m.brand}</p>}

                                        {(() => {
                                            const activeBooking = m.machine_bookings?.find((mb: any) => mb.end_time === null)
                                            if (m.status === 'in_use' && activeBooking?.bookings) {
                                                const cust = Array.isArray(activeBooking.bookings.customer) ? activeBooking.bookings.customer[0] : activeBooking.bookings.customer
                                                return (
                                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                                                        <p className="text-xs font-semibold text-yellow-800">Sedang Digunakan</p>
                                                        <p className="text-xs text-yellow-700 mt-0.5"><span className="font-medium">Oleh:</span> {cust?.full_name || 'Pelanggan'}</p>
                                                        <p className="text-xs text-yellow-700 mt-0.5"><span className="font-medium">Resi:</span> {activeBooking.bookings.booking_code}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        })()}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-1">
                                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEditOpen(m)}>Edit</Button>
                                        {m.status !== 'maintenance' ? (
                                            <Button variant="ghost" size="sm" className="flex-1 text-orange-600" isLoading={updatingId === m.id} onClick={() => handleUpdateStatus(m.id, 'maintenance')}>Perawatan</Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="flex-1 text-green-600" isLoading={updatingId === m.id} onClick={() => handleUpdateStatus(m.id, 'available')}>Aktifkan</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Daftar Mesin ({filtered.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapasitas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga/kg</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? [...Array(4)].map((_, i) => (
                                    <tr key={i}><td className="px-6 py-4" colSpan={5}><Skeleton className="h-4 w-full" /></td></tr>
                                )) : filtered.map((m) => {
                                    const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.available
                                    return (
                                        <tr key={m.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{m.machine_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{TYPE_LABELS[m.machine_type]}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{m.capacity_kg ? `${m.capacity_kg}kg` : '-'}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-blue-600">Rp {m.price_per_kg?.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={sc.variant}>{sc.label}</Badge>
                                                {(() => {
                                                    const activeBooking = m.machine_bookings?.find((mb: any) => mb.end_time === null)
                                                    if (m.status === 'in_use' && activeBooking?.bookings) {
                                                        const cust = Array.isArray(activeBooking.bookings.customer) ? activeBooking.bookings.customer[0] : activeBooking.bookings.customer
                                                        return (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {cust?.full_name || 'Pelanggan'} ({activeBooking.bookings.booking_code})
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditOpen(m)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedMachine(m); setShowDeleteDialog(true) }}>Hapus</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Mesin" size="md"
                footer={<><Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Batal</Button><Button onClick={handleAdd} isLoading={isSubmitting}>Simpan</Button></>}>
                <div className="space-y-4">
                    {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{formError}</p></div>}
                    <Input label="Nomor Mesin" placeholder="cth: MC-001" value={addForm.machine_number} onChange={(e) => setAddForm({ ...addForm, machine_number: e.target.value })} required />
                    <Select label="Tipe Mesin" options={TYPE_OPTIONS} value={addForm.machine_type} onChange={(e) => setAddForm({ ...addForm, machine_type: e.target.value })} />
                    <Input label="Merk" placeholder="cth: Samsung" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Kapasitas (kg)" type="number" placeholder="cth: 8" value={addForm.capacity_kg} onChange={(e) => setAddForm({ ...addForm, capacity_kg: e.target.value })} />
                        <Input label="Harga Per Kg (Rp)" type="number" placeholder="cth: 5000" value={addForm.price_per_kg} onChange={(e) => setAddForm({ ...addForm, price_per_kg: e.target.value })} required />
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Mesin" description={selectedMachine?.machine_number} size="md"
                footer={<><Button variant="ghost" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Batal</Button><Button onClick={handleEdit} isLoading={isSubmitting}>Simpan</Button></>}>
                <div className="space-y-4">
                    {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{formError}</p></div>}
                    <Input label="Nomor Mesin" value={editForm.machine_number} onChange={(e) => setEditForm({ ...editForm, machine_number: e.target.value })} />
                    <Select label="Tipe Mesin" options={TYPE_OPTIONS} value={editForm.machine_type} onChange={(e) => setEditForm({ ...editForm, machine_type: e.target.value })} />
                    <Input label="Merk" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Kapasitas (kg)" type="number" value={editForm.capacity_kg} onChange={(e) => setEditForm({ ...editForm, capacity_kg: e.target.value })} />
                        <Input label="Harga Per Kg (Rp)" type="number" value={editForm.price_per_kg} onChange={(e) => setEditForm({ ...editForm, price_per_kg: e.target.value })} required />
                    </div>
                    <Select label="Status" options={[{ value: 'available', label: 'Tersedia' }, { value: 'in_use', label: 'Digunakan' }, { value: 'maintenance', label: 'Perawatan' }]} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} />
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDelete}
                title="Hapus Mesin" description={`Yakin ingin menghapus ${selectedMachine?.machine_number}?`} confirmText="Hapus" variant="danger" isLoading={isSubmitting} />
        </div>
    )
}