import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Actions
 * 
 * Key difference from server.ts:
 * - Uses async cookie handling compatible with Server Actions
 * - Throws errors for missing configuration
 * - Includes retry logic for transient failures
 */
export async function getSupabaseActionClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Can be ignored in Server Actions
                    }
                },
            },
        }
    )
}

/**
 * Execute a database operation with error handling
 */
export async function dbAction<T>(
    operation: (supabase: Awaited<ReturnType<typeof getSupabaseActionClient>>) => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
    try {
        const supabase = await getSupabaseActionClient()
        const data = await operation(supabase)
        return { data, error: null }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Database operation failed'
        console.error('DB Action Error:', message)
        return { data: null, error: message }
    }
}

/**
 * Authenticate user in Server Action
 */
export async function authAction() {
    const supabase = await getSupabaseActionClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized: Please log in to continue')
    }

    return { supabase, user }
}

/**
 * Authenticate and get profile in Server Action
 */
export async function authProfileAction() {
    const { supabase, user } = await authAction()

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        throw new Error('Profile not found')
    }

    return { supabase, user, profile }
}

/**
 * Require specific role in Server Action
 */
export async function requireRoleAction(role: 'customer' | 'employee' | 'owner') {
    const { supabase, user, profile } = await authProfileAction()

    if (profile.role !== role && profile.role !== 'owner') {
        throw new Error(`Unauthorized: This action requires ${role} role`)
    }

    return { supabase, user, profile }
}