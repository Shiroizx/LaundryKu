'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface OrderRow {
    id: string
    booking_code: string
    service_type: string
    status: string
    weight_kg: number | null
    total_amount: number
    pickup_time: string | null
    created_at: string
    customer?: {
        full_name: string
        phone: string | null
    }
    employee?: {
        profile?: {
            full_name: string
        }
    }
}

export function useOwnerOrders() {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])
    const [orders, setOrders] = useState<OrderRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_code,
                    service_type,
                    status,
                    weight_kg,
                    total_amount,
                    pickup_time,
                    created_at,
                    customer:profiles!user_id(full_name, phone),
                    employee:employees!employee_id(profile:profiles!user_id(full_name))
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    const channelId = useMemo(() => `owner-orders-${Math.random().toString(36).substring(2, 11)}`, [])

    useEffect(() => {
        fetchOrders()

        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => { fetchOrders() }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchOrders, supabase, channelId])

    const updateOrderStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setOrders(prev => prev.map(order => 
            order.id === id ? { ...order, status: newStatus } : order
        ))

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id)
            
            if (error) {
                // Revert on error
                fetchOrders()
                throw error
            }
        } catch (err) {
            console.error('Failed to update status:', err)
            throw err
        }
    }

    return {
        orders,
        isLoading,
        error,
        refresh: fetchOrders,
        updateOrderStatus
    }
}
