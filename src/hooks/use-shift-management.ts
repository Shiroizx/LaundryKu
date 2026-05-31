'use client'

import { useState, useCallback, useMemo } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface EmployeeSchedule {
    id: string
    employee_id: string
    day_of_week: number // 0=Minggu, 1=Senin, ... 6=Sabtu
    start_time: string  // "HH:MM:SS"
    end_time: string    // "HH:MM:SS"
    is_active: boolean
    created_at: string
    updated_at: string
}

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

/**
 * Hook untuk Owner mengelola jadwal shift karyawan.
 */
export function useShiftManagement() {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const [schedules, setSchedules] = useState<EmployeeSchedule[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    /**
     * Ambil semua jadwal untuk satu karyawan tertentu.
     */
    const fetchSchedules = useCallback(async (employeeId: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('employee_schedules')
                .select('*')
                .eq('employee_id', employeeId)
                .order('day_of_week', { ascending: true })

            if (fetchError) throw fetchError
            setSchedules((data || []) as EmployeeSchedule[])
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Gagal memuat jadwal'))
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    /**
     * Set / update jadwal satu hari untuk satu karyawan.
     * Gunakan upsert agar tidak duplikat (UNIQUE employee_id + day_of_week).
     */
    const upsertSchedule = useCallback(async (
        employeeId: string,
        dayOfWeek: number,
        startTime: string,
        endTime: string
    ) => {
        const { error: upsertError } = await supabase
            .from('employee_schedules')
            .upsert({
                employee_id: employeeId,
                day_of_week: dayOfWeek,
                start_time: startTime,
                end_time: endTime,
                is_active: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'employee_id,day_of_week',
            })

        if (upsertError) throw upsertError
    }, [supabase])

    /**
     * Hapus jadwal satu hari untuk satu karyawan.
     */
    const deleteSchedule = useCallback(async (employeeId: string, dayOfWeek: number) => {
        const { error: deleteError } = await supabase
            .from('employee_schedules')
            .delete()
            .eq('employee_id', employeeId)
            .eq('day_of_week', dayOfWeek)

        if (deleteError) throw deleteError
    }, [supabase])

    /**
     * Simpan semua jadwal sekaligus untuk satu karyawan.
     * activeSchedules: array { dayOfWeek, startTime, endTime } yang aktif.
     * Hari yang tidak ada di array akan DIHAPUS (set jadwal penuh).
     */
    const saveAllSchedules = useCallback(async (
        employeeId: string,
        activeSchedules: { dayOfWeek: number; startTime: string; endTime: string }[]
    ) => {
        // 1. Hapus semua jadwal lama
        const { error: deleteAllError } = await supabase
            .from('employee_schedules')
            .delete()
            .eq('employee_id', employeeId)

        if (deleteAllError) throw deleteAllError

        // 2. Insert jadwal baru (jika ada)
        if (activeSchedules.length > 0) {
            const rows = activeSchedules.map(s => ({
                employee_id: employeeId,
                day_of_week: s.dayOfWeek,
                start_time: s.startTime,
                end_time: s.endTime,
                is_active: true,
            }))

            const { error: insertError } = await supabase
                .from('employee_schedules')
                .insert(rows)

            if (insertError) throw insertError
        }
    }, [supabase])

    return {
        schedules,
        isLoading,
        error,
        fetchSchedules,
        upsertSchedule,
        deleteSchedule,
        saveAllSchedules,
    }
}

/**
 * Hook untuk Customer/Employee membaca jadwal semua karyawan aktif.
 * Digunakan untuk filter ketersediaan karyawan saat buat pesanan.
 */
export function useEmployeeSchedules() {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const [allSchedules, setAllSchedules] = useState<EmployeeSchedule[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchAllSchedules = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('employee_schedules')
                .select('*')
                .eq('is_active', true)

            if (error) throw error
            setAllSchedules((data || []) as EmployeeSchedule[])
        } catch (err) {
            console.error('Error loading employee schedules:', err)
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    /**
     * Cek apakah seorang karyawan memiliki jadwal di hari dan jam tertentu.
     * dayOfWeek: 0-6 (0=Minggu, JS getDay() format)
     * hour: jam (0-23)
     */
    const isEmployeeScheduled = useCallback((
        employeeId: string,
        dayOfWeek: number,
        hour: number
    ): boolean => {
        const schedule = allSchedules.find(
            s => s.employee_id === employeeId && s.day_of_week === dayOfWeek && s.is_active
        )
        if (!schedule) return false

        const startHour = parseInt(schedule.start_time.split(':')[0])
        const endHour = parseInt(schedule.end_time.split(':')[0])
        return hour >= startHour && hour < endHour
    }, [allSchedules])

    /**
     * Dapatkan semua employee_id yang bertugas pada hari dan jam tertentu.
     */
    const getScheduledEmployeeIds = useCallback((
        dayOfWeek: number,
        hour: number
    ): string[] => {
        return allSchedules
            .filter(s => {
                if (!s.is_active || s.day_of_week !== dayOfWeek) return false
                const startHour = parseInt(s.start_time.split(':')[0])
                const endHour = parseInt(s.end_time.split(':')[0])
                return hour >= startHour && hour < endHour
            })
            .map(s => s.employee_id)
    }, [allSchedules])

    return {
        allSchedules,
        isLoading,
        fetchAllSchedules,
        isEmployeeScheduled,
        getScheduledEmployeeIds,
    }
}
