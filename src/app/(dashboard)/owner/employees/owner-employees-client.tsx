'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { createEmployeeAccountAction, updateEmployeeAccountAction } from '@/app/actions/owner'
import { deleteEmployeeAction, toggleActiveAction, saveSchedulesAction, getSchedulesAction } from './actions'

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const SHIFT_OPTIONS = [
    { value: '', label: 'Belum ditentukan' },
    { value: 'morning', label: 'Pagi (06:00 - 14:00)' },
    { value: 'afternoon', label: 'Siang (14:00 - 22:00)' },
    { value: 'night', label: 'Malam (22:00 - 06:00)' },
]

const SHIFT_LABELS: Record<string, string> = {
    morning: 'Pagi',
    afternoon: 'Siang',
    night: 'Malam',
}

const SCHEDULE_HOURS = Array.from({ length: 16 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

export default function OwnerEmployeesClient({ initialEmployees }: { initialEmployees: any[] }) {
    const router = useRouter()
    const [employees, setEmployees] = useState(initialEmployees)
    const isLoading = false
    const error = null

    useEffect(() => {
        setEmployees(initialEmployees)
    }, [initialEmployees])

    // For refreshing if needed (we update locally where possible, but can call router.refresh)
    const refresh = (showLoader = false) => {
        router.refresh()
    }

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Schedule modal state
    const [schedules, setSchedules] = useState<any[]>([])
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [scheduleEmployee, setScheduleEmployee] = useState<typeof employees[0] | null>(null)
    const [isSavingSchedule, setIsSavingSchedule] = useState(false)
    const [scheduleError, setScheduleError] = useState<string | null>(null)
    // daySchedules: 7 slots for days 0-6. null means day is off.
    const [daySchedules, setDaySchedules] = useState<Array<{ active: boolean; startTime: string; endTime: string }>>([
        { active: false, startTime: '08:00', endTime: '16:00' }, // Minggu(0)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Senin(1)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Selasa(2)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Rabu(3)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Kamis(4)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Jumat(5)
        { active: false, startTime: '08:00', endTime: '16:00' }, // Sabtu(6)
    ])

    const handleOpenScheduleModal = useCallback(async (employee: typeof employees[0]) => {
        setScheduleEmployee(employee)
        setScheduleError(null)
        setIsLoadingSchedules(true)

        // Reset all days to off first
        const blank: Array<{ active: boolean; startTime: string; endTime: string }> = Array.from({ length: 7 }, () => ({
            active: false, startTime: '08:00', endTime: '16:00'
        }))

        setDaySchedules(blank)
        setShowScheduleModal(true)

        // Load existing schedules via Server Action
        try {
            const res = await getSchedulesAction(employee.id)
            if (res.success && res.data) {
                setSchedules(res.data)
                const synced = [...blank]
                res.data.forEach((s: any) => {
                    synced[s.day_of_week] = {
                        active: true,
                        startTime: s.start_time.slice(0, 5),
                        endTime: s.end_time.slice(0, 5),
                    }
                })
                setDaySchedules(synced)
            }
        } catch (_) {
            // ignore, show blank if fails
        } finally {
            setIsLoadingSchedules(false)
        }
    }, [])

    // Add form state
    const [addForm, setAddForm] = useState({
        fullName: '',
        email: '',
        password: '',
        employee_code: '',
        position: '',
        hourly_rate: '',
        hire_date: '',
    })

    // Edit form state
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        password: '',
        employee_code: '',
        position: '',
        hourly_rate: '',
        hire_date: '',
    })

    // Filter state
    const [filterShift, setFilterShift] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    const resetAddForm = () => {
        setAddForm({ fullName: '', email: '', password: '', employee_code: '', position: '', hourly_rate: '', hire_date: '' })
        setFormError(null)
    }

    const handleAdd = async () => {
        setFormError(null)
        if (!addForm.fullName || !addForm.email || !addForm.employee_code || !addForm.position) {
            setFormError('Silakan isi Nama, Email, Kode Karyawan, dan Posisi')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await createEmployeeAccountAction({
                fullName: addForm.fullName,
                email: addForm.email,
                password: addForm.password,
                employeeCode: addForm.employee_code,
                position: addForm.position,
                hourlyRate: addForm.hourly_rate ? parseFloat(addForm.hourly_rate) : 0,
                hireDate: addForm.hire_date || null,
            })
            if (!res.success) throw new Error(res.error)
            
            setShowAddModal(false)
            resetAddForm()
            router.refresh() // Wait for server to pass down new initialEmployees
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal menambahkan karyawan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditOpen = (employee: typeof employees[0]) => {
        setSelectedEmployee(employee)
        setEditForm({
            fullName: employee.profile?.full_name || '',
            email: employee.profile?.email || '',
            password: '', // Password kosong secara default untuk edit
            employee_code: employee.employee_code,
            position: employee.position,
            hourly_rate: String(employee.hourly_rate || ''),
            hire_date: employee.hire_date || '',
        })
        setFormError(null)
        setShowEditModal(true)
    }

    const handleEdit = async () => {
        if (!selectedEmployee || !selectedEmployee.user_id) return
        setFormError(null)
        if (!editForm.fullName || !editForm.email || !editForm.employee_code || !editForm.position) {
            setFormError('Silakan isi Nama, Email, Kode Karyawan, dan Posisi')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateEmployeeAccountAction({
                employeeId: selectedEmployee.id,
                userId: selectedEmployee.user_id!,
                fullName: editForm.fullName,
                email: editForm.email,
                password: editForm.password,
                employeeCode: editForm.employee_code,
                position: editForm.position,
                hourlyRate: editForm.hourly_rate ? parseFloat(editForm.hourly_rate) : 0,
                hireDate: editForm.hire_date || null,
            })
            if (!res.success) throw new Error(res.error)
            
            setShowEditModal(false)
            setSelectedEmployee(null)
            router.refresh()
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal mengupdate karyawan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const handleToggleActive = async (id: string, isActive: boolean) => {
        setUpdatingId(id)
        try {
            // Optimistic update
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, is_active: !isActive } : e))
            const res = await toggleActiveAction(id, isActive)
            if (!res.success) {
                // Revert
                setEmployees(prev => prev.map(e => e.id === id ? { ...e, is_active: isActive } : e))
                console.error(res.error)
            }
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedEmployee) return
        setIsSubmitting(true)
        try {
            const res = await deleteEmployeeAction(selectedEmployee.id, selectedEmployee.user_id)
            if (res.success) {
                setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id))
                setShowDeleteDialog(false)
                setSelectedEmployee(null)
            }
        } catch (err) {
            console.error('Delete error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveSchedule = async () => {
        if (!scheduleEmployee) return
        setIsSavingSchedule(true)
        setScheduleError(null)
        try {
            // Validate: if day is active, end time must be after start time
            for (let i = 0; i < 7; i++) {
                const d = daySchedules[i]
                if (d.active) {
                    const startH = parseInt(d.startTime.split(':')[0])
                    const endH = parseInt(d.endTime.split(':')[0])
                    if (endH <= startH) {
                        setScheduleError(`Jam selesai hari ${DAY_NAMES[i]} harus lebih dari jam mulai`)
                        return
                    }
                }
            }
            const activeSchedules = daySchedules
                .map((d, idx) => ({ dayOfWeek: idx, ...d }))
                .filter(d => d.active)
                .map(d => ({ dayOfWeek: d.dayOfWeek, startTime: d.startTime + ':00', endTime: d.endTime + ':00' }))

            const res = await saveSchedulesAction(scheduleEmployee.id, activeSchedules)
            if (!res.success) throw new Error(res.error)
            
            setShowScheduleModal(false)
            setScheduleEmployee(null)
        } catch (err) {
            setScheduleError(err instanceof Error ? err.message : 'Gagal menyimpan jadwal')
        } finally {
            setIsSavingSchedule(false)
        }
    }

    // Filter
    const filteredEmployees = employees.filter(e => {
        const matchShift = filterShift === 'all' || e.shift === filterShift
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && e.is_active) ||
            (filterStatus === 'inactive' && !e.is_active)
        return matchShift && matchStatus
    })

    // Stats
    const stats = {
        total: employees.length,
        active: employees.filter(e => e.is_active).length,
        inactive: employees.filter(e => !e.is_active).length,
    }



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Karyawan</h1>
                    <p className="text-gray-500 mt-1">Kelola data karyawan laundry</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refresh(true)}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </Button>
                    <Button onClick={() => { resetAddForm(); setShowAddModal(true) }}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Karyawan
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Karyawan</p>
                                <span className="block text-2xl font-bold text-gray-900">
                                    {isLoading ? <Skeleton className="h-7 w-12" /> : stats.total}
                                </span>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Aktif</p>
                                <span className="block text-2xl font-bold text-green-600">
                                    {isLoading ? <Skeleton className="h-7 w-12" /> : stats.active}
                                </span>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Nonaktif</p>
                                <span className="block text-2xl font-bold text-red-600">
                                    {isLoading ? <Skeleton className="h-7 w-12" /> : stats.inactive}
                                </span>
                            </div>
                            <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <select
                            value={filterShift}
                            onChange={(e) => setFilterShift(e.target.value)}
                            className="w-full sm:w-auto h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Shift</option>
                            <option value="morning">Pagi</option>
                            <option value="afternoon">Siang</option>
                            <option value="night">Malam</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Karyawan ({filteredEmployees.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                                        </tr>
                                    ))
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p>Belum ada karyawan</p>
                                            <p className="text-sm mt-1">Klik &quot;Tambah Karyawan&quot; untuk menambahkan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {employee.profile?.full_name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {employee.profile?.full_name || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {employee.profile?.email || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-blue-600">
                                                {employee.employee_code}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {employee.position}
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.shift ? (
                                                    <Badge variant="info" size="sm">
                                                        {SHIFT_LABELS[employee.shift] || employee.shift}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={employee.is_active ? 'success' : 'danger'} size="sm">
                                                    {employee.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditOpen(employee)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenScheduleModal(employee)}
                                                    >
                                                        Atur Jadwal
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        isLoading={updatingId === employee.id}
                                                        onClick={() => handleToggleActive(employee.id, employee.is_active)}
                                                    >
                                                        {employee.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => { setSelectedEmployee(employee); setShowDeleteDialog(true) }}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Tambah Karyawan"
                description="Daftarkan user yang sudah register sebagai pegawai ke dalam sistem"
                size="md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Batal</Button>
                        <Button onClick={handleAdd} isLoading={isSubmitting}>Simpan</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{formError}</p>
                        </div>
                    )}

                    <Input
                        label="Nama Karyawan"
                        placeholder="cth: Budi Santoso"
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="cth: budi@laundry.com"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password (opsional)"
                        type="password"
                        placeholder="Default: laundry123"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    />

                    <Input
                        label="Kode Karyawan"
                        placeholder="cth: EMP-001"
                        value={addForm.employee_code}
                        onChange={(e) => setAddForm({ ...addForm, employee_code: e.target.value })}
                        required
                    />
                    <Input
                        label="Posisi"
                        placeholder="cth: Operator Mesin"
                        value={addForm.position}
                        onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                        required
                    />

                    <Input
                        label="Gaji Per Jam (Rp)"
                        type="number"
                        placeholder="0"
                        value={addForm.hourly_rate}
                        onChange={(e) => setAddForm({ ...addForm, hourly_rate: e.target.value })}
                    />
                    <Input
                        label="Tanggal Mulai Kerja"
                        type="date"
                        value={addForm.hire_date}
                        onChange={(e) => setAddForm({ ...addForm, hire_date: e.target.value })}
                    />
                </div>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Karyawan"
                description={selectedEmployee?.profile?.full_name || ''}
                size="md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Batal</Button>
                        <Button onClick={handleEdit} isLoading={isSubmitting}>Simpan</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{formError}</p>
                        </div>
                    )}
                    <Input
                        label="Nama Karyawan"
                        placeholder="cth: Budi Santoso"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="cth: budi@laundry.com"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password Baru (Kosongkan jika tidak ingin diubah)"
                        type="password"
                        placeholder="Masukkan password baru"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                    <Input
                        label="Kode Karyawan"
                        placeholder="cth: EMP-001"
                        value={editForm.employee_code}
                        onChange={(e) => setEditForm({ ...editForm, employee_code: e.target.value })}
                        required
                    />
                    <Input
                        label="Posisi"
                        placeholder="cth: Operator Mesin"
                        value={editForm.position}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        required
                    />
                    <Input
                        label="Gaji Per Jam (Rp)"
                        type="number"
                        placeholder="0"
                        value={editForm.hourly_rate}
                        onChange={(e) => setEditForm({ ...editForm, hourly_rate: e.target.value })}
                    />
                    <Input
                        label="Tanggal Mulai Kerja"
                        type="date"
                        value={editForm.hire_date}
                        onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                title="Hapus Karyawan"
                description={`Apakah Anda yakin ingin menghapus ${selectedEmployee?.profile?.full_name || 'karyawan ini'}? Data yang sudah dihapus tidak dapat dikembalikan.`}
                confirmText="Hapus"
                variant="danger"
                isLoading={isSubmitting}
            />

            {/* Schedule Modal */}
            <Modal
                isOpen={showScheduleModal}
                onClose={() => !isSavingSchedule && setShowScheduleModal(false)}
                title={`Atur Jadwal Shift — ${scheduleEmployee?.profile?.full_name || ''}`}
                description="Centang hari kerja dan tentukan jam mulai & selesai untuk setiap hari."
                size="md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowScheduleModal(false)} disabled={isSavingSchedule}>Batal</Button>
                        <Button onClick={handleSaveSchedule} isLoading={isSavingSchedule}>Simpan Jadwal</Button>
                    </>
                }
            >
                <div className="space-y-3 py-1">
                    {scheduleError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{scheduleError}</p>
                        </div>
                    )}

                    {isLoadingSchedules ? (
                        <div className="space-y-3">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500 mb-3">
                                Jadwal yang tersimpan: {schedules.length > 0
                                    ? schedules.map(s => DAY_NAMES[s.day_of_week]).join(', ')
                                    : 'Belum ada jadwal'}
                            </p>

                            {/* Initializing logic has been moved to handleOpenScheduleModal */}

                            <div className="space-y-2">
                                {/* Senin - Sabtu - Minggu */}
                                {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                                    const d = daySchedules[dayIndex]
                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`rounded-xl border p-3 transition-colors ${
                                                d.active
                                                    ? 'border-indigo-300 bg-indigo-50 '
                                                    : 'border-gray-200 bg-white '
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id={`day-${dayIndex}`}
                                                    checked={d.active}
                                                    onChange={(e) => {
                                                        const updated = [...daySchedules]
                                                        updated[dayIndex] = { ...d, active: e.target.checked }
                                                        setDaySchedules(updated)
                                                    }}
                                                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                />
                                                <label
                                                    htmlFor={`day-${dayIndex}`}
                                                    className={`font-semibold text-sm w-16 cursor-pointer ${
                                                        d.active ? 'text-indigo-700 ' : 'text-gray-500 '
                                                    }`}
                                                >
                                                    {DAY_NAMES[dayIndex]}
                                                </label>

                                                {d.active && (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500">Mulai</span>
                                                            <select
                                                                value={d.startTime}
                                                                onChange={(e) => {
                                                                    const updated = [...daySchedules]
                                                                    updated[dayIndex] = { ...d, startTime: e.target.value }
                                                                    setDaySchedules(updated)
                                                                }}
                                                                className="h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                            >
                                                                {SCHEDULE_HOURS.map(hour => (
                                                                    <option key={hour} value={hour}>{hour}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className="text-gray-400">—</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500">Selesai</span>
                                                            <select
                                                                value={d.endTime}
                                                                onChange={(e) => {
                                                                    const updated = [...daySchedules]
                                                                    updated[dayIndex] = { ...d, endTime: e.target.value }
                                                                    setDaySchedules(updated)
                                                                }}
                                                                className="h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                            >
                                                                {SCHEDULE_HOURS.map(hour => (
                                                                    <option key={hour} value={hour}>{hour}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                {!d.active && (
                                                    <span className="text-xs text-gray-400 italic">Libur</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    )
}
