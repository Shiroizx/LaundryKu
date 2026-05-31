import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerOrdersNewClient } from './customer-orders-new-client'

export const metadata = {
    title: 'Buat Pesanan Baru - LaundryKu',
    description: 'Buat pesanan laundry baru',
}

interface ActiveEmployee {
    id: string
    full_name: string
    position: string
    /** Hari kerja: array of day_of_week (0=Minggu, 1=Senin, ..., 6=Sabtu) */
    scheduledDays: number[]
    /** Jam kerja per hari: map dari day_of_week ke { startHour, endHour } */
    scheduleHours: Record<number, { startHour: number; endHour: number }>
}

export default async function NewBookingPage() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-2xl mx-auto mt-8">
                <p>Silakan login kembali untuk membuat pesanan.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // 1. Fetch employees dengan shift schedules
    const empPromise = supabase
        .from('employees')
        .select(`
            id,
            position,
            profile:profiles!user_id(full_name),
            schedules:employee_schedules(day_of_week, start_time, end_time, is_active)
        `)
        .eq('is_active', true)

    // 2. Fetch active bookings untuk cek bentrok jam
    const bookingsPromise = supabase
        .from('bookings')
        .select('employee_id, pickup_time')
        .not('employee_id', 'is', null)
        .not('pickup_time', 'is', null)
        .not('status', 'in', '("finished","picked_up","cancelled")')

    const [empResult, bookingsResult] = await Promise.all([empPromise, bookingsPromise])

    if (empResult.error || bookingsResult.error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-2xl mx-auto mt-8">
                <p>Gagal memuat data pegawai: {empResult.error?.message || bookingsResult.error?.message}</p>
            </div>
        )
    }

    const formattedEmployees: ActiveEmployee[] = (empResult.data || []).map((e: any) => {
        const activeSchedules = (e.schedules || []).filter((s: any) => s.is_active)
        const scheduledDays: number[] = activeSchedules.map((s: any) => s.day_of_week)
        
        const scheduleHours: Record<number, { startHour: number; endHour: number }> = {}
        activeSchedules.forEach((s: any) => {
            scheduleHours[s.day_of_week] = {
                startHour: parseInt(s.start_time.split(':')[0]),
                endHour: parseInt(s.end_time.split(':')[0])
            }
        })

        return {
            id: e.id,
            full_name: e.profile?.full_name || 'Tanpa Nama',
            position: e.position,
            scheduledDays,
            scheduleHours
        }
    })

    return (
        <CustomerOrdersNewClient 
            initialEmployees={formattedEmployees} 
            initialActiveBookings={bookingsResult.data || []} 
        />
    )
}
