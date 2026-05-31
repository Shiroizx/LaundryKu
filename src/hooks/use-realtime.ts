'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
    table: string
    filter?: {
        column: string
        value: string
    }
    onInsert?: (payload: unknown) => void
    onUpdate?: (payload: unknown) => void
    onDelete?: (payload: unknown) => void
    enabled?: boolean
}

/**
 * Hook for subscribing to Supabase Realtime changes
 */
export function useRealtime({
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
}: UseRealtimeOptions) {
    const [channel, setChannel] = useState<RealtimeChannel | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        if (!enabled) return

        const supabase = getSupabaseBrowserClient()

        let channelName = `realtime:${table}`
        if (filter) {
            channelName += `:${filter.column}=${filter.value}`
        }

        const ch = supabase.channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table,
                    filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
                },
                (payload) => {
                    const eventType = (payload as { eventType?: string }).eventType
                    if (eventType === 'INSERT' && onInsert) {
                        onInsert(payload)
                    } else if (eventType === 'UPDATE' && onUpdate) {
                        onUpdate(payload)
                    } else if (eventType === 'DELETE' && onDelete) {
                        onDelete(payload)
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED')
            })

        channelRef.current = ch

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [table, filter, enabled, onInsert, onUpdate, onDelete])

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            const supabase = getSupabaseBrowserClient()
            supabase.removeChannel(channelRef.current)
            channelRef.current = null
            setChannel(null)
            setIsConnected(false)
        }
    }, [])

    return {
        channel,
        isConnected,
        unsubscribe,
    }
}

/**
 * Hook for real-time order tracking
 */
export function useOrderRealtime(orderId: string, onUpdate?: (order: unknown) => void) {
    const updateCallback = useCallback((payload: unknown) => {
        const p = payload as { new?: unknown }
        if (onUpdate && p.new) {
            onUpdate(p.new)
        }
    }, [onUpdate])

    return useRealtime({
        table: 'orders',
        filter: { column: 'id', value: orderId },
        onUpdate: updateCallback,
        enabled: !!orderId,
    })
}

/**
 * Hook for real-time notifications
 */
export function useNotificationRealtime(userId: string) {
    const insertCallback = useCallback((payload: unknown) => {
        const p = payload as { new?: unknown }
        if (p.new) {
            console.log('New notification:', p.new)
        }
    }, [])

    return useRealtime({
        table: 'notifications',
        filter: { column: 'user_id', value: userId },
        onInsert: insertCallback,
        enabled: !!userId,
    })
}