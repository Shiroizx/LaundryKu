'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
    OwnerDashboardStats,
    BookingWithRelations,
    Machine,
    Employee,
} from '@/lib/supabase/database-types'

interface UseOwnerDashboardOptions {
    enabled?: boolean
}

interface UseOwnerDashboardReturn {
    stats: OwnerDashboardStats | null
    recentBookings: BookingWithRelations[]
    machines: Machine[]
    employees: Employee[]
    isLoading: boolean
    error: Error | null
    refresh: () => Promise<void>
}

/**
 * Hook for fetching and subscribing to owner dashboard data
 * Uses Supabase Realtime for live updates
 */
export function useOwnerDashboard({
    enabled = true,
}: UseOwnerDashboardOptions = {}): UseOwnerDashboardReturn {
    const supabase = useMemo(() => getSupabaseBrowserClient(), [])

    const [stats, setStats] = useState<OwnerDashboardStats | null>(null)
    const [recentBookings, setRecentBookings] = useState<BookingWithRelations[]>([])
    const [machines, setMachines] = useState<Machine[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Generate a unique channel ID per hook instance to prevent race conditions during routing transitions
    const channelId = useMemo(() => `owner-dashboard-${Math.random().toString(36).substring(2, 11)}`, [])

    // Fetch stats from database
    const fetchStats = useCallback(async () => {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
            { count: totalBookings },
            { count: activeBookings },
            paymentsResult,
            completedBookingsResult,
            { count: machinesAvailable },
            { count: machinesTotal },
            { count: employeesActive },
        ] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(finished,picked_up,cancelled)'),
            supabase.from('payments').select('amount').eq('status', 'paid'),
            supabase.from('bookings').select('total_amount').in('status', ['finished', 'picked_up']),
            supabase.from('machines').select('*', { count: 'exact', head: true }).eq('status', 'available'),
            supabase.from('machines').select('*', { count: 'exact', head: true }),
            supabase.from('employees').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ])

        const payments = paymentsResult.data as { amount: number }[] | null
        const completedBookings = completedBookingsResult.data as { total_amount: number }[] | null
        
        let totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        if (totalRevenue === 0 && completedBookings) {
            totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0)
        }

        setStats({
            totalBookings: totalBookings || 0,
            activeBookings: activeBookings || 0,
            totalRevenue,
            machinesAvailable: machinesAvailable || 0,
            machinesTotal: machinesTotal || 0,
            employeesActive: employeesActive || 0,
        })
    }, [supabase])

    // Fetch recent bookings
    const fetchRecentBookings = useCallback(async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:profiles!user_id(id, full_name, email, phone)
            `)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error
        setRecentBookings(data || [])
    }, [supabase])

    // Fetch machines
    const fetchMachines = useCallback(async () => {
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .order('machine_number', { ascending: true })

        if (error) throw error
        setMachines(data || [])
    }, [supabase])

    // Fetch employees
    const fetchEmployees = useCallback(async () => {
        const { data, error } = await supabase
            .from('employees')
            .select(`
                *,
                profile:profiles!user_id(id, full_name, email, phone)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        setEmployees(data || [])
    }, [supabase])

    // Main fetch function
    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            await Promise.all([
                fetchStats(),
                fetchRecentBookings(),
                fetchMachines(),
                fetchEmployees(),
            ])
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setIsLoading(false)
        }
    }, [fetchStats, fetchRecentBookings, fetchMachines, fetchEmployees])

    // Initial fetch and realtime subscriptions
    useEffect(() => {
        if (!enabled) return

        refresh()

        // Set up realtime subscriptions
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    // Refresh data on any booking change
                    fetchRecentBookings()
                    fetchStats()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'machines' },
                () => {
                    fetchMachines()
                    fetchStats()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'employees' },
                () => {
                    fetchEmployees()
                    fetchStats()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                () => {
                    fetchStats()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [enabled, refresh, fetchRecentBookings, fetchMachines, fetchEmployees, fetchStats, supabase])

    return {
        stats,
        recentBookings,
        machines,
        employees,
        isLoading,
        error,
        refresh,
    }
}

/**
 * Hook for subscribing to specific booking realtime updates
 */
export function useBookingRealtime(
    bookingId: string | null,
    onUpdate?: (booking: BookingWithRelations) => void
) {
    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        if (!bookingId) return

        const channelId = `booking-${bookingId}-${Math.random().toString(36).substring(2, 11)}`
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`,
                },
                (payload) => {
                    if (onUpdate && payload.new) {
                        onUpdate(payload.new as BookingWithRelations)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, onUpdate, supabase])
}

/**
 * Hook for machine status realtime updates
 */
export function useMachineRealtime(
    onUpdate?: (machine: Machine) => void,
    onInsert?: (machine: Machine) => void
) {
    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        const channelId = `machines-realtime-${Math.random().toString(36).substring(2, 11)}`
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'machines' },
                (payload) => {
                    if (onUpdate && payload.new) {
                        onUpdate(payload.new as Machine)
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'machines' },
                (payload) => {
                    if (onInsert && payload.new) {
                        onInsert(payload.new as Machine)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [onUpdate, onInsert, supabase])
}