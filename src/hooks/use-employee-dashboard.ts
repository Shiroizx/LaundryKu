'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getEmployeeBookings, updateBookingStatusAction } from '@/app/actions/employee'
import type { Booking, Profile, BookingStatus } from '@/lib/supabase/database-types'

export interface BookingWithCustomer extends Booking {
    customer: Profile
    payments?: { status: string }[]
}

interface EmployeeStats {
    todayQueue: number
    completedToday: number
    readyToPickup: number
    totalAssigned: number
}

interface UseEmployeeDashboardReturn {
    profile: Profile | null
    todayBookings: BookingWithCustomer[]
    assignedBookings: BookingWithCustomer[]
    stats: EmployeeStats
    isLoading: boolean
    error: Error | null
    refresh: () => Promise<void>
    updateBookingStatus: (bookingId: string, newStatus: BookingStatus) => Promise<boolean>
}

/**
 * Hook for fetching employee dashboard data with realtime updates
 */
export function useEmployeeDashboard(): UseEmployeeDashboardReturn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseBrowserClient() as any

    const [profile, setProfile] = useState<Profile | null>(null)
    const [todayBookings, setTodayBookings] = useState<BookingWithCustomer[]>([])
    const [assignedBookings, setAssignedBookings] = useState<BookingWithCustomer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const getCurrentUserId = useCallback(async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) return null
            return user.id
        } catch {
            return null
        }
    }, [supabase])

    // Fetch employee profile
    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data as Profile | null
    }, [supabase])

    // Data fetcher (delegated to Server Action)
    const fetchDashboardData = useCallback(async (userId: string) => {
        return await getEmployeeBookings(userId)
    }, [])

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const userId = await getCurrentUserId()
            if (!userId) {
                setIsLoading(false)
                return
            }

            console.log("Employee Dashboard: Fetching data...")
            const [profileData, dashboardData] = await Promise.all([
                fetchProfile(userId),
                fetchDashboardData(userId),
            ])
            console.log("Employee Dashboard: Data fetched!")

            setProfile(profileData)
            setTodayBookings(dashboardData.todayData as BookingWithCustomer[])
            setAssignedBookings(dashboardData.assignedData as BookingWithCustomer[])
        } catch (err) {
            console.error("Employee Dashboard Error:", err)
            alert("Error: " + (err instanceof Error ? err.message : 'Unknown error'))
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setIsLoading(false)
        }
    }, [getCurrentUserId, fetchProfile, fetchDashboardData])

    // Update booking status
    const updateBookingStatus = useCallback(async (bookingId: string, newStatus: BookingStatus): Promise<boolean> => {
        // Optimistic update
        setTodayBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
        setAssignedBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))

        try {
            const userId = await getCurrentUserId()
            if (!userId) return false

            await updateBookingStatusAction(bookingId, newStatus, userId)

            // Background refresh to ensure consistency
            refresh()
            return true
        } catch (err) {
            console.error('[Employee] Update status error:', err)
            await refresh() // Revert
            return false
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, getCurrentUserId])

    // Generate a unique channel ID per hook instance to prevent race conditions during routing transitions
    const channelId = useMemo(() => `employee-dashboard-${Math.random().toString(36).substring(2, 11)}`, [])

    // Initial fetch and realtime subscriptions
    useEffect(() => {
        refresh()

        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => { refresh() }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Computed stats
    const stats: EmployeeStats = {
        todayQueue: todayBookings.filter(b => !['finished', 'picked_up', 'cancelled'].includes(b.status)).length,
        completedToday: todayBookings.filter(b => ['finished', 'picked_up'].includes(b.status)).length,
        readyToPickup: todayBookings.filter(b => b.status === 'finished').length,
        totalAssigned: assignedBookings.length,
    }

    return {
        profile,
        todayBookings,
        assignedBookings,
        stats,
        isLoading,
        error,
        refresh,
        updateBookingStatus,
    }
}
