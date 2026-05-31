'use client'

import { AuthProvider } from '@/components/providers/auth-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import { GlobalTopLoader } from '@/components/providers/top-loader'

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SupabaseProvider>
            <AuthProvider>
                <ToastProvider>
                    <GlobalTopLoader />
                    {children}
                </ToastProvider>
            </AuthProvider>
        </SupabaseProvider>
    )
}