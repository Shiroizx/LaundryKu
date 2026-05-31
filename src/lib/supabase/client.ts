import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Supabase Client for Browser/Client Components
 * 
 * Usage:
 * - Use in Client Components (marked with 'use client')
 * - Use in React hooks
 * - Access browser cookies if needed
 * 
 * @example
 * // In a client component
 * 'use client'
 * import { getSupabaseBrowserClient } from '@/lib/supabase/client'
 * 
 * const supabase = getSupabaseBrowserClient()
 * const { data } = await supabase.from('orders').select()
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getSupabaseBrowserClient() {
    if (browserClient) return browserClient

    browserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    return browserClient
}

export function getSupabaseBrowserClientSingleton() {
    return getSupabaseBrowserClient()
}