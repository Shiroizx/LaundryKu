'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface SupabaseContextType {
    supabase: ReturnType<typeof getSupabaseBrowserClient>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
    const supabase = getSupabaseBrowserClient()

    return (
        <SupabaseContext.Provider value={{ supabase }}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase() {
    const context = useContext(SupabaseContext)

    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider')
    }

    return context
}

/**
 * Hook to access Supabase client directly
 */
export function useSupabaseClient() {
    const { supabase } = useSupabase()
    return supabase
}