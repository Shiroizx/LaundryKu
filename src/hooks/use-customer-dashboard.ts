'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Booking, Payment, Profile, BookingStatus } from '@/lib/supabase/database-types'
import { useAuth } from '@/components/providers/auth-provider'

/**
 * Safely get the current authenticated user ID.
 * Uses getUser() which validates the JWT with the server,
 * ensuring the token is refreshed if expired (e.g. after tab idle).
 * Includes retry logic: if the first attempt fails (common after tab switch),
 * it triggers a session refresh and retries once.
 */
async function getAuthenticatedUserId(supabase: any): Promise<string | null> {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) return user.id

        // First attempt failed — try refreshing the session, then retry
        // This handles expired JWT tokens after tab idle/switch
        console.log('[Auth] First getUser() failed, refreshing session...')
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
            console.warn('[Auth] Session refresh failed:', refreshError.message)
            return null
        }

        const { data: { user: retryUser }, error: retryError } = await supabase.auth.getUser()
        if (retryError || !retryUser) {
            console.warn('[Auth] Retry getUser() also failed:', retryError?.message)
            return null
        }
        return retryUser.id
    } catch {
        return null
    }
}

interface CustomerProfile extends Profile {
    // Additional customer-specific data if needed
}

interface BookingWithPayment extends Booking {
    payment?: Payment[]
}

import { useRouter } from 'next/navigation'

interface UseCustomerDashboardOptions {
    initialProfile?: CustomerProfile | null
    initialBookings?: BookingWithPayment[]
    initialPayments?: Payment[]
    enabled?: boolean
}

interface UseCustomerDashboardReturn {
    profile: CustomerProfile | null
    bookings: BookingWithPayment[]
    activeBookings: BookingWithPayment[]
    completedBookings: BookingWithPayment[]
    payments: Payment[]
    stats: {
        totalOrders: number
        totalSpent: number
        readyToPickup: number
    }
    isLoading: boolean
    error: Error | null
    refresh: (isBackground?: boolean) => Promise<void>
    updateBookingStatus: (bookingId: string, newStatus: BookingStatus) => Promise<boolean>
}

const EMPTY_ARRAY: any[] = []

export function useCustomerDashboard({
    initialProfile = null,
    initialBookings = EMPTY_ARRAY,
    initialPayments = EMPTY_ARRAY,
    enabled = true,
}: UseCustomerDashboardOptions = {}): UseCustomerDashboardReturn {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const router = useRouter()

    const [profile, setProfile] = useState<CustomerProfile | null>(initialProfile)
    const [bookings, setBookings] = useState<BookingWithPayment[]>(initialBookings)
    const [payments, setPayments] = useState<Payment[]>(initialPayments)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    
    // Track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true)
    
    // Generate a unique channel ID per hook instance to prevent race conditions during routing transitions
    const channelId = useMemo(() => `customer-dashboard-${Math.random().toString(36).substring(2, 11)}`, [])

    // Sync with server component props
    useEffect(() => {
        setProfile(initialProfile)
        setBookings(initialBookings)
        setPayments(initialPayments)
    }, [initialProfile, initialBookings, initialPayments])

    const refresh = useCallback(async (isBackground = false) => {
        if (!isBackground) setIsLoading(true)
        setError(null)
        
        try {
            console.log(`[Customer Dashboard] Refreshing via Server Components...`);
            // Instruct Next.js to re-fetch server components
            router.refresh()
        } catch (err: any) {
            console.error('[Customer Dashboard] Error:', err)
            if (isMountedRef.current) {
                setError(err instanceof Error ? err : new Error('Gagal memuat data'))
            }
        } finally {
            if (isMountedRef.current) {
                // router.refresh() does not return a promise we can await for completion,
                // but we can turn off loading state shortly after.
                setTimeout(() => {
                    if (isMountedRef.current) setIsLoading(false)
                }, 500)
            }
        }
    }, [router])

    // Update booking status
    const updateBookingStatus = useCallback(async (bookingId: string, newStatus: BookingStatus): Promise<boolean> => {
        const uid = profile?.id || (await getAuthenticatedUserId(supabase));
        if (!uid) {
            console.error('[Customer] User not authenticated for update');
            return false;
        }

        // Optimistic update
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))

        try {
            const { updateCustomerBookingStatusAction } = await import('@/app/actions/customer');
            await updateCustomerBookingStatusAction(bookingId, newStatus, uid);
            refresh()
            return true
        } catch (err) {
            console.error('[Customer] Update status error:', err)
            await refresh() // Revert
            return false
        }
    }, [profile?.id, refresh])

    // Keep refresh function reference updated for the events
    const refreshRef = useRef(refresh)
    useEffect(() => {
        refreshRef.current = refresh
    }, [refresh])

    // Initial fetch and realtime subscriptions
    useEffect(() => {
        if (!enabled) return
        
        isMountedRef.current = true

        // Set up realtime subscriptions
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload: any) => {
                    // Refresh bookings on any change
                    refreshRef.current(true)
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                (payload: any) => {
                    refreshRef.current(true)
                }
            )
            .subscribe()

        return () => {
            isMountedRef.current = false
            supabase.removeChannel(channel)
        }
    }, [supabase, channelId, enabled])

    // Computed values
    const activeBookings = bookings.filter(
        b => !['finished', 'picked_up', 'cancelled'].includes(b.status)
    )
    const completedBookings = bookings.filter(
        b => ['finished', 'picked_up'].includes(b.status)
    )

    // Calculate stats
    const totalSpent = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0)

    const stats = {
        totalOrders: bookings.length,
        totalSpent,
        readyToPickup: bookings.filter(b => b.status === 'finished').length,
    }

    return {
        profile,
        bookings,
        activeBookings,
        completedBookings,
        payments,
        stats,
        isLoading,
        error,
        refresh,
        updateBookingStatus,
    }
}

/**
 * Hook for tracking a specific booking
 */
export function useBookingTracking(bookingId: string | null, initialBooking: BookingWithPayment | null = null) {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const router = useRouter()
    
    const [booking, setBooking] = useState<BookingWithPayment | null>(initialBooking)
    const [isLoading, setIsLoading] = useState(!initialBooking)

    // Sync with server component props
    useEffect(() => {
        if (initialBooking) {
            setBooking(initialBooking)
            setIsLoading(false)
        }
    }, [initialBooking])

    useEffect(() => {
        if (!bookingId) return

        const trackingChannelId = `booking-tracking-${bookingId}-${Math.random().toString(36).substring(2, 11)}`
        const channel = supabase
            .channel(trackingChannelId)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`,
                },
                (payload: any) => {
                    // Refresh data from server instead of handling locally to ensure full relational data (e.g. payments)
                    console.log(`[Booking Tracking] Booking updated, refreshing via Server Components...`)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, supabase, router])

    return { booking, isLoading }
}