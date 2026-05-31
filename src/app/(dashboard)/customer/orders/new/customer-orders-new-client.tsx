'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBookingAction } from './actions'

const SERVICE_OPTIONS = [
    { value: 'full_service', label: 'Cuci Lengkap (Cuci + Setrika) - Rp 8.000/kg' },
    { value: 'express', label: 'Cuci Kilat 1 Hari Jadi - Rp 15.000/kg' },
]

interface ActiveEmployee {
    id: string
    full_name: string
    position: string
    scheduledDays: number[]
    scheduleHours: Record<number, { startHour: number; endHour: number }>
}

interface CustomerOrdersNewClientProps {
    initialEmployees: ActiveEmployee[]
    initialActiveBookings: { employee_id: string; pickup_time: string }[]
}

export function CustomerOrdersNewClient({ initialEmployees, initialActiveBookings }: CustomerOrdersNewClientProps) {
    const router = useRouter()
    const [employees] = useState(initialEmployees)
    const [activeBookings] = useState(initialActiveBookings)

    const [form, setForm] = useState({
        service_type: 'full_service',
        employee_id: 'random',
        weight_kg: '',
        pickup_time: '',
        notes: '',
    })

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Generate date options for the next 7 days
    const dates = useMemo(() => {
        const list = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            list.push(d)
        }
        return list
    }, [])

    // Get time slots based on day type (weekday vs weekend operating hours)
    const timeSlots = useMemo(() => {
        if (!selectedDate) return []
        const d = new Date(selectedDate)
        const isWeekend = d.getDay() === 0 || d.getDay() === 6
        const slots = []
        const startHour = isWeekend ? 9 : 8
        const endHour = isWeekend ? 20 : 22
        for (let h = startHour; h <= endHour; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }, [selectedDate])

    // Get employees who are scheduled on a given day + hour (based on shift)
    const getScheduledEmployeesForSlot = useCallback((dateStr: string, timeStr: string) => {
        const d = new Date(dateStr)
        const dayOfWeek = d.getDay() // 0=Minggu, 1=Senin, ...
        const hour = parseInt(timeStr.split(':')[0])

        return employees.filter(emp => {
            // Check if employee is scheduled on this day
            if (!emp.scheduledDays.includes(dayOfWeek)) return false
            // Check if the slot hour falls within their work hours
            const hours = emp.scheduleHours[dayOfWeek]
            if (!hours) return false
            return hour >= hours.startHour && hour < hours.endHour
        })
    }, [employees])

    // Helper to find which employee IDs are busy (have existing orders) in a given slot
    const getBusyEmployeesForSlot = useCallback((dateStr: string, timeStr: string) => {
        const slotDateTime = new Date(`${dateStr}T${timeStr}:00`)
        return activeBookings.filter(b => {
            if (!b.pickup_time) return false
            const bDate = new Date(b.pickup_time)
            return bDate.getFullYear() === slotDateTime.getFullYear() &&
                   bDate.getMonth() === slotDateTime.getMonth() &&
                   bDate.getDate() === slotDateTime.getDate() &&
                   bDate.getHours() === slotDateTime.getHours()
        }).map(b => b.employee_id)
    }, [activeBookings])

    // Check if all scheduled employees for a slot are busy → slot is full
    const isSlotFull = useCallback((dateStr: string, timeStr: string) => {
        const scheduled = getScheduledEmployeesForSlot(dateStr, timeStr)
        if (scheduled.length === 0) return true // No one scheduled = unavailable
        const busyIds = getBusyEmployeesForSlot(dateStr, timeStr)
        return scheduled.every(emp => busyIds.includes(emp.id))
    }, [getScheduledEmployeesForSlot, getBusyEmployeesForSlot])

    // Sync selected Date and Time to form.pickup_time
    useEffect(() => {
        if (selectedDate && selectedTime) {
            setForm(prev => ({ ...prev, pickup_time: `${selectedDate}T${selectedTime}:00` }))
        } else {
            setForm(prev => ({ ...prev, pickup_time: '' }))
        }
    }, [selectedDate, selectedTime])

    // Filter available employees for the currently selected slot:
    // 1. Must be scheduled on that day/hour
    // 2. Must not have an existing order at that time
    const availableEmployees = useMemo(() => {
        if (!selectedDate || !selectedTime) return [] // Don't show employees before slot is chosen
        const scheduled = getScheduledEmployeesForSlot(selectedDate, selectedTime)
        const busyIds = getBusyEmployeesForSlot(selectedDate, selectedTime)
        return scheduled.filter(emp => !busyIds.includes(emp.id))
    }, [employees, selectedDate, selectedTime, getScheduledEmployeesForSlot, getBusyEmployeesForSlot])

    const calculateTotal = useCallback((serviceType: string, weightKg: number) => {
        const prices = {
            'full_service': 8000,
            'washing_only': 5000,
            'ironing_only': 5000,
            'express': 15000,
            'self_service': 5000
        }
        return (prices[serviceType as keyof typeof prices] || 8000) * (weightKg || 1)
    }, [])

    const total = calculateTotal(form.service_type, form.weight_kg ? parseFloat(form.weight_kg) : 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!form.service_type) {
            setSubmitError('Pilih layanan terlebih dahulu')
            return
        }

        if (!form.weight_kg) {
            setSubmitError('Perkiraan berat cucian wajib diisi')
            return
        }

        if (!form.employee_id) {
            setSubmitError('Silakan pilih pegawai atau pilih opsi Acak')
            return
        }

        if (!form.pickup_time) {
            setSubmitError('Tanggal & waktu pengambilan wajib diisi')
            return
        }

        let finalEmployeeId = form.employee_id
        if (form.employee_id === 'random') {
            if (availableEmployees.length === 0) {
                setSubmitError('Maaf, tidak ada pegawai yang tersedia (terjadwal dan bebas) pada tanggal dan waktu tersebut. Silakan pilih waktu lain.')
                return
            }
            const randomIndex = Math.floor(Math.random() * availableEmployees.length)
            finalEmployeeId = availableEmployees[randomIndex].id
        } else {
            if (!availableEmployees.some(emp => emp.id === form.employee_id)) {
                setSubmitError('Pegawai yang Anda pilih tidak bertugas atau sudah memiliki jadwal di jam/hari tersebut. Silakan pilih pegawai lain atau gunakan opsi Acak.')
                return
            }
        }

        setIsSubmitting(true)
        try {
            const result = await createBookingAction({
                service_type: form.service_type,
                employee_id: finalEmployeeId,
                weight_kg: parseFloat(form.weight_kg),
                pickup_time: form.pickup_time,
                notes: form.notes || null,
            })
            
            if (result.error) {
                setSubmitError(result.error)
            } else {
                router.push(`/customer/payments/${result.bookingId}`)
            }
        } catch (err) {
            console.error("Submission error:", err);
            setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Buat Pesanan Baru</h1>
                <p className="text-gray-500 mt-1">Isi detail cucian Anda di bawah ini</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Layanan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {submitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    {submitError}
                                </p>
                            </div>
                        )}

                        <Select
                            label="Pilih Layanan"
                            options={SERVICE_OPTIONS}
                            value={form.service_type}
                            onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                            required
                        />

                        <Input
                            label="Perkiraan Berat (kg)"
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="Contoh: 3.5"
                            value={form.weight_kg}
                            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                            helperText="Berat pasti akan ditimbang kembali oleh pegawai kami"
                            required
                        />

                        {/* Custom Date & Time Picker */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Pilih Tanggal Pengambilan <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {dates.map((date) => {
                                    const dateStr = date.toISOString().split('T')[0]
                                    const isSelected = selectedDate === dateStr
                                    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()]
                                    const dateNum = date.getDate()
                                    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][date.getMonth()]
                                    
                                    return (
                                        <button
                                            key={dateStr}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDate(dateStr)
                                                setSelectedTime('')
                                                // Reset employee selection
                                                setForm(prev => ({ ...prev, employee_id: 'random' }))
                                            }}
                                            className={`flex-shrink-0 w-24 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                                                isSelected 
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold scale-105 shadow-sm' 
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                                            }`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">{dayName}</span>
                                            <span className="text-2xl font-black my-1">{dateNum}</span>
                                            <span className="text-[10px] font-semibold">{monthName}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pilih Jam Pengambilan <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-500 block font-normal mt-0.5">
                                        Jam Operasional: {new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6 ? 'Sabtu-Minggu 09:00 - 21:00' : 'Senin-Jumat 08:00 - 23:00'}
                                    </span>
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {timeSlots.map((timeStr) => {
                                        const isSelected = selectedTime === timeStr
                                        
                                        // Past-hour check for today
                                        const todayStr = new Date().toISOString().split('T')[0]
                                        const isToday = selectedDate === todayStr
                                        const currentHour = new Date().getHours()
                                        const slotHour = parseInt(timeStr.split(':')[0])
                                        const isPast = isToday && slotHour <= currentHour
                                        
                                        // Full check: no available scheduled employees
                                        const full = isSlotFull(selectedDate, timeStr)
                                        const disabled = isPast || full
                                        
                                        return (
                                            <button
                                                key={timeStr}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => {
                                                    setSelectedTime(timeStr)
                                                    // Reset employee when time changes
                                                    setForm(prev => ({ ...prev, employee_id: 'random' }))
                                                }}
                                                className={`p-2.5 rounded-lg border text-sm text-center transition-all flex flex-col items-center justify-center font-medium ${
                                                    isSelected 
                                                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-sm' 
                                                    : disabled 
                                                        ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-50 line-through' 
                                                        : 'border-gray-200 text-gray-700 bg-white hover:border-blue-500 hover:text-blue-600'
                                                }`}
                                            >
                                                <span>{timeStr}</span>
                                                {full && !isPast && <span className="text-[9px] text-red-500 font-bold block mt-0.5">Penuh</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Employee Selector — only shown after date + time selected */}
                        {selectedDate && selectedTime && (
                            <div className="space-y-2">
                                <Select
                                    label="Pilih Pegawai"
                                    options={[
                                        { value: 'random', label: 'Acak (Pilihkan Otomatis dari yang Tersedia)' },
                                        ...availableEmployees.map(e => ({ value: e.id, label: `${e.full_name} (${e.position})` }))
                                    ]}
                                    value={form.employee_id}
                                    onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                                    helperText={
                                        availableEmployees.length === 0
                                            ? 'Tidak ada pegawai yang bertugas di jam ini'
                                            : `${availableEmployees.length} pegawai tersedia dan bertugas di jam ini`
                                    }
                                    required
                                />
                                {availableEmployees.length === 0 && (
                                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                                        ⚠️ Tidak ada pegawai yang memiliki jadwal pada hari dan jam ini. Silakan pilih waktu lain.
                                    </p>
                                )}
                            </div>
                        )}

                        {(!selectedDate || !selectedTime) && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
                                ℹ️ Pilih tanggal dan jam terlebih dahulu untuk melihat pegawai yang tersedia.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Catatan Khusus
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                rows={3}
                                placeholder="Contoh: Pisahkan baju putih, gunakan pelembut ekstra..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col border-t border-gray-100 bg-gray-50 p-6">
                        <div className="w-full flex justify-between items-center mb-6">
                            <span className="text-gray-600 font-medium">Estimasi Biaya:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                Rp {total.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="w-full flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => router.push('/customer')}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex-1"
                                isLoading={isSubmitting}
                            >
                                Buat Pesanan
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
