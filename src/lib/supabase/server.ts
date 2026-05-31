import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Client for Server Components and Server Actions
 * 
 * Usage:
 * - Server Components: Fetch data in RSC
 * - Server Actions: Form actions, mutations
 * - Route Handlers: API routes that need auth
 */
export async function createServerSupabase() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Components can't set cookies in render
                        // This is expected - cookies are set via headers()
                    }
                },
            },
        }
    )
}

/**
 * Get current authenticated user from server
 */
export async function getAuthenticatedUser() {
    const supabase = await createServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    return user
}

/**
 * Get current user profile with role
 */
export async function getUserProfile() {
    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('Auth error in getUserProfile:', authError?.message || 'No user')
        return null
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Profile fetch error in getUserProfile:', profileError.message, profileError.code)
        return null
    }

    return profile
}

/**
 * Get current session (includes access token)
 */
export async function getSession() {
    const supabase = await createServerSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        return null
    }

    return session
}

/**
 * Admin client that bypasses RLS
 * ONLY use this in Server Actions/Handlers when absolutely necessary!
 */
export function createAdminSupabase() {
    const { createClient } = require('@supabase/supabase-js')
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<'customer' | 'employee' | 'owner' | null> {
    const profile = await getUserProfile()
    return profile?.role ?? null
}

/**
 * Check if current user has specific role
 */
export async function hasRole(...roles: Array<'customer' | 'employee' | 'owner'>) {
    const role = await getUserRole()
    return role !== null && roles.includes(role)
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
    const user = await getAuthenticatedUser()

    if (!user) {
        throw new Error('Unauthorized: Authentication required')
    }

    return user
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(...roles: Array<'customer' | 'employee' | 'owner'>) {
    const user = await requireAuth()
    const profile = await getUserProfile()

    if (!profile) {
        throw new Error('Unauthorized: Profile not found')
    }

    if (!roles.includes(profile.role)) {
        throw new Error(`Unauthorized: Required role ${roles.join(' or ')}`)
    }

    return { user, profile }
}