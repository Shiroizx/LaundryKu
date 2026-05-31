'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Machine, MACHINE_TYPE_CONFIG } from '@/lib/supabase/database-types'
import { useRouter } from 'next/navigation'
import { loadMachineBookingsAction, createMachineBookingAction } from './actions'

const toLocalISOString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzoffset).toISOString();
}

interface CustomerBookingsClientProps {
    initialMachines: Machine[]
}

export function CustomerBookingsClient({ initialMachines }: CustomerBookingsClientProps) {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const router = useRouter()
    
    const [machines, setMachines] = useState<Machine[]>(initialMachines)
    const [bookingMachine, setBookingMachine] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
    const [form, setForm] = useState({
        weight_kg: '',
        notes: ''
    })

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [duration, setDuration] = useState(1) // default 1 hour
    const [machineBookings, setMachineBookings] = useState<any[]>([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)

    // Sync with server component props
    useEffect(() => {
        setMachines(initialMachines)
    }, [initialMachines])

    const loadMachineBookings = useCallback(async (machineId: string) => {
        setIsLoadingBookings(true)
        try {
            const { data, error } = await loadMachineBookingsAction(machineId)
            if (error) throw new Error(error)
            setMachineBookings(data || [])
        } catch (err) {
            console.error('Error loading machine bookings:', err)
        } finally {
            setIsLoadingBookings(false)
        }
    }, [])

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
        const isWeekend = d.getDay() === 0 || d.getDay() === 6 // 0: Sunday, 6: Saturday
        const slots = []
        
        // Monday-Friday: 08:00 - 23:00 (last slot starts at 23 - duration)
        // Saturday-Sunday: 09:00 - 21:00 (last slot starts at 21 - duration)
        const startHour = isWeekend ? 9 : 8
        const endHour = isWeekend ? 21 : 23
        
        const maxStartHour = endHour - duration
        
        for (let h = startHour; h <= maxStartHour; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }, [selectedDate, duration])

    // Reset selected time if duration exceeds operating hours
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const d = new Date(selectedDate)
            const isWeekend = d.getDay() === 0 || d.getDay() === 6
            const endHour = isWeekend ? 21 : 23
            const hour = parseInt(selectedTime.split(':')[0])
            if (hour + duration > endHour) {
                setSelectedTime('')
            }
        }
    }, [duration, selectedDate, selectedTime])

    // Check if slot has overlap with existing bookings
    const isSlotConflicted = useCallback((dateStr: string, timeStr: string, slotDuration: number) => {
        const slotStart = new Date(`${dateStr}T${timeStr}:00`)
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 60 * 1000)

        return machineBookings.some(b => {
            if (b.booking?.status === 'cancelled') return false

            const bStart = new Date(b.start_time)
            const bEnd = b.end_time 
                ? new Date(b.end_time) 
                : new Date(bStart.getTime() + 2 * 60 * 60 * 1000)

            return slotStart < bEnd && slotEnd > bStart
        })
    }, [machineBookings])

    // Subscribe to realtime updates for machines
    useEffect(() => {
        const channelId = `machines-customer-${Math.random().toString(36).substring(2, 11)}`
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'machines' },
                () => { 
                    router.refresh() 
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    const handleConfirmBook = async () => {
        if (!selectedMachine) return;
        if (!form.weight_kg) {
            alert('Perkiraan berat wajib diisi')
            return;
        }

        const weight = parseFloat(form.weight_kg)
        const capacity = selectedMachine.capacity_kg ?? 0
        if (weight > capacity) {
            alert(`Berat perkiraan (${weight} kg) melebihi kapasitas maksimal mesin (${capacity} kg)`)
            return;
        }

        if (!selectedDate || !selectedTime) {
            alert('Silakan pilih tanggal dan jam booking')
            return;
        }

        if (isSlotConflicted(selectedDate, selectedTime, duration)) {
            alert('Maaf, slot waktu yang Anda pilih sudah terpakai. Silakan pilih slot waktu lain.')
            return;
        }

        // Calculate start and end times in local timezone
        const start = new Date(`${selectedDate}T${selectedTime}:00`)
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

        const todayStr = toLocalISOString(new Date()).split('T')[0]
        const currentHour = new Date().getHours()
        const slotHour = parseInt(selectedTime.split(':')[0])
        const isImmediate = selectedDate === todayStr && slotHour === currentHour

        const startTimeStr = isImmediate ? new Date().toISOString() : start.toISOString()
        const endTimeStr = end.toISOString()

        setBookingMachine(selectedMachine.id)
        try {
            const durationText = `${duration} Jam`
            const timeText = `${selectedDate} ${selectedTime} (${durationText})`
            const defaultNotes = `Booking Mesin #${selectedMachine.machine_number} (Self-Service) pada ${timeText}`
            const finalNotes = form.notes 
                ? `${form.notes} (${defaultNotes})`
                : defaultNotes

            const result = await createMachineBookingAction({
                machine_id: selectedMachine.id,
                machine_number: selectedMachine.machine_number,
                machine_type: selectedMachine.machine_type,
                price_per_kg: selectedMachine.price_per_kg || 5000,
                weight_kg: weight,
                start_time: startTimeStr,
                end_time: endTimeStr,
                duration: duration,
                notes: finalNotes,
                is_immediate: isImmediate
            })

            if (result.error) {
                throw new Error(result.error)
            }

            alert('Pemesanan mesin berhasil! Silakan selesaikan pembayaran Anda.')
            setIsModalOpen(false)
            setForm({ weight_kg: '', notes: '' })
            setSelectedDate('')
            setSelectedTime('')
            setDuration(1)
            
            router.push(`/customer/payments/${result.booking_id}`)
        } catch (err: any) {
            console.error('Machine booking error:', err)
            alert('Gagal melakukan pemesanan mesin: ' + (err.message || 'Terjadi kesalahan'))
        } finally {
            setBookingMachine(null)
        }
    }

    const openBookingModal = (machine: Machine) => {
        setSelectedMachine(machine)
        setIsModalOpen(true)
        setSelectedDate('')
        setSelectedTime('')
        setDuration(1)
        setForm({ weight_kg: '', notes: '' })
        loadMachineBookings(machine.id)
    }

    const availableMachines = machines.filter(m => m.status === 'available')
    const inUseMachines = machines.filter(m => m.status === 'in_use')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Mesin</h1>
                <p className="text-gray-500 mt-1">Layanan mandiri (Self-Service) - Pesan mesin cuci/pengering yang tersedia</p>
            </div>

            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">Tersedia {availableMachines.length} Mesin</h2>
                            <p className="text-blue-100">Silakan pilih mesin yang sedang kosong di bawah ini untuk memulai pencucian mandiri Anda.</p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <div className="bg-white/20 px-4 py-2 rounded-lg text-center backdrop-blur-sm">
                                <p className="text-2xl font-bold">{inUseMachines.length}</p>
                                <p className="text-xs text-blue-100">Dipakai</p>
                            </div>
                            <div className="bg-white/20 px-4 py-2 rounded-lg text-center backdrop-blur-sm">
                                <p className="text-2xl font-bold">{machines.length}</p>
                                <p className="text-xs text-blue-100">Total Mesin</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-gray-50 rounded-xl border border-gray-200">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">Tidak ada mesin terdaftar</p>
                        <p className="text-gray-500">Toko saat ini belum menambahkan mesin ke dalam sistem.</p>
                    </div>
                ) : (
                    machines.map(machine => {
                        const isAvailable = machine.status === 'available'
                        const isMaintenance = machine.status === 'maintenance'
                        
                        return (
                            <Card key={machine.id} className={`overflow-hidden transition-all duration-300 ${isAvailable ? 'hover:shadow-lg hover:border-blue-200' : 'opacity-75'}`}>
                                <div className={`h-2 ${
                                    isAvailable ? 'bg-green-500' : 
                                    isMaintenance ? 'bg-orange-500' : 'bg-yellow-500'
                                }`} />
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            isAvailable ? 'bg-green-100 text-green-600' : 
                                            isMaintenance ? 'bg-orange-100 text-orange-600' : 
                                            'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <Badge variant={isAvailable ? 'success' : isMaintenance ? 'orange' : 'warning'}>
                                            {isAvailable ? 'Tersedia' : isMaintenance ? 'Perawatan' : 'Dipakai'}
                                        </Badge>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        Mesin #{machine.machine_number}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-1.5">
                                        {MACHINE_TYPE_CONFIG[machine.machine_type]?.label || machine.machine_type} 
                                        {machine.capacity_kg ? ` • Kapasitas ${machine.capacity_kg}kg` : ''}
                                    </p>
                                    <p className="text-blue-600 text-sm font-bold mb-4">
                                        Harga: Rp {machine.price_per_kg?.toLocaleString('id-ID') || '5.000'} / kg
                                    </p>
                                    
                                    <Button 
                                        className="w-full" 
                                        disabled={!isAvailable || bookingMachine === machine.id}
                                        onClick={() => openBookingModal(machine)}
                                        variant={isAvailable ? 'primary' : 'secondary'}
                                    >
                                        {bookingMachine === machine.id ? 'Memproses...' : 
                                         isAvailable ? 'Pesan Sekarang' : 
                                         isMaintenance ? 'Sedang Perawatan' : 'Sedang Dipakai'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => !bookingMachine && setIsModalOpen(false)}
                title="Konfirmasi Booking Mesin"
                description={selectedMachine ? `Mesin #${selectedMachine.machine_number} - ${MACHINE_TYPE_CONFIG[selectedMachine.machine_type]?.label}` : ''}
            >
                <div className="space-y-4 py-2 text-left">
                    <div>
                        <Input
                            label={`Perkiraan Berat (kg) - Maks. ${selectedMachine?.capacity_kg ?? 0} kg`}
                            type="number"
                            min="0.1"
                            max={selectedMachine?.capacity_kg ?? undefined}
                            step="0.1"
                            placeholder="Contoh: 3.5"
                            value={form.weight_kg}
                            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                            required
                        />
                        {form.weight_kg && selectedMachine && parseFloat(form.weight_kg) > (selectedMachine.capacity_kg ?? 0) && (
                            <p className="text-red-600 text-xs font-semibold mt-1.5 animate-pulse">
                                ⚠️ Berat melebihi kapasitas maksimum mesin ({selectedMachine.capacity_kg} kg)!
                            </p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                            <span className="text-gray-500 block text-xs mb-0.5">Harga per kg</span>
                            <span className="font-semibold text-gray-900">Rp {selectedMachine?.price_per_kg?.toLocaleString('id-ID') || '5.000'} / kg</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100/50 text-sm">
                            <span className="text-blue-600 block text-xs mb-0.5">Estimasi Total</span>
                            <span className="font-bold text-blue-700">
                                Rp {((parseFloat(form.weight_kg) || 0) * (selectedMachine?.price_per_kg || 5000)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Duration Selection dihilangkan sesuai request, default 1 jam */}

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Pilih Tanggal Booking <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {dates.map((date) => {
                                const dateStr = toLocalISOString(date).split('T')[0]
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
                                            setSelectedTime('') // Reset time slot selection when date changes
                                        }}
                                        className={`flex-shrink-0 w-16 p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                            isSelected 
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold scale-105 shadow-sm' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                                        }`}
                                    >
                                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">{dayName}</span>
                                        <span className="text-lg font-black my-0.5">{dateNum}</span>
                                        <span className="text-[8px] font-semibold">{monthName}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Pilih Jam Booking <span className="text-red-500">*</span>
                                <span className="text-[10px] text-gray-500 block font-normal mt-0.5">
                                    Operasional: {new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6 ? 'Sabtu-Minggu 09:00 - 21:00' : 'Senin-Jumat 08:00 - 23:00'}
                                </span>
                            </label>
                            {isLoadingBookings ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-lg">
                                    {timeSlots.map((timeStr) => {
                                        const isSelected = selectedTime === timeStr
                                        
                                        // Past-hour check for today
                                        const todayStr = toLocalISOString(new Date()).split('T')[0]
                                        const isToday = selectedDate === todayStr
                                        const currentHour = new Date().getHours()
                                        const slotHour = parseInt(timeStr.split(':')[0])
                                        const isPast = isToday && slotHour < currentHour
                                        
                                        // Conflict check
                                        const isBooked = isSlotConflicted(selectedDate, timeStr, duration)
                                        const disabled = isPast || isBooked
                                        
                                        return (
                                            <button
                                                key={timeStr}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => setSelectedTime(timeStr)}
                                                className={`py-1.5 rounded border text-xs text-center transition-all flex flex-col items-center justify-center font-medium ${
                                                    isSelected 
                                                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-sm' 
                                                    : disabled 
                                                        ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-50 line-through' 
                                                        : 'border-gray-200 text-gray-700 bg-white hover:border-blue-500 hover:text-blue-600'
                                                }`}
                                            >
                                                <span>{timeStr}</span>
                                                {isBooked && !isPast && <span className="text-[8px] text-red-500 font-bold block">Terpakai</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Catatan Khusus (Opsional)
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                            rows={2}
                            placeholder="Contoh: Pisahkan baju putih..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsModalOpen(false)}
                            disabled={bookingMachine !== null}
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleConfirmBook} 
                            disabled={
                                bookingMachine !== null || 
                                !form.weight_kg || 
                                parseFloat(form.weight_kg) <= 0 || 
                                parseFloat(form.weight_kg) > (selectedMachine?.capacity_kg || 0) ||
                                !selectedDate ||
                                !selectedTime
                            }
                            isLoading={bookingMachine !== null}
                        >
                            Konfirmasi Booking
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
