'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    isLoading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = getSupabaseBrowserClient()

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return data as Profile | null
    }

    const refreshProfile = async () => {
        if (user) {
            const newProfile = await fetchProfile(user.id)
            setProfile(newProfile)
        }
    }

    useEffect(() => {
        // Get initial session - use getUser() to validate JWT with server
        const initializeAuth = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser()

            if (currentUser) {
                setUser(currentUser)
                // Also get the session for components that need it
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                setSession(currentSession)
                const profileData = await fetchProfile(currentUser.id)
                setProfile(profileData)
            }

            setIsLoading(false)
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    // Token refresh failed or user actually signed out.
                    // Reloading ensures we either redirect to login (if truly signed out)
                    // or recover the session from the server cookie (if race condition).
                    window.location.reload()
                    return
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }

                setIsLoading(false)
            }
        )

        // Proactively refresh session when user returns to tab
        // This ensures auth tokens are valid before sub-route hooks try to fetch data
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                try {
                    const { data, error } = await supabase.auth.refreshSession()
                    if (!error && data.session) {
                        setSession(data.session)
                        setUser(data.session.user)
                    }
                } catch (err) {
                    console.warn('[AuthProvider] Session refresh on tab focus failed:', err)
                }
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                isLoading,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

/**
 * Hook to get current user role
 */
export function useRole() {
    const { profile } = useAuth()

    return {
        role: profile?.role ?? null,
        isCustomer: profile?.role === 'customer',
        isEmployee: profile?.role === 'employee',
        isOwner: profile?.role === 'owner',
        isLoading: !profile && !profile,
    }
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(...roles: Array<'customer' | 'employee' | 'owner'>) {
    const { profile } = useAuth()

    return profile?.role ? roles.includes(profile.role) : false
}

/**
 * Hook to require authentication (throws if not authenticated)
 */
export function useRequireAuth() {
    const { user, isLoading } = useAuth()

    if (!isLoading && !user) {
        throw new Error('Authentication required')
    }

    return { user, isLoading }
}