/**
 * Auth Server Actions
 * Handles login, register, and logout using Supabase Auth
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export type AuthResult = {
    success: boolean
    error?: string
    user?: any
    debug?: string
}

/**
 * Login with email and password
 */
export async function login(formData: FormData): Promise<AuthResult> {
    try {
        const supabase = await createServerSupabase()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) {
            return { success: false, error: 'Email dan password harus diisi' }
        }

        console.log('[Login] Attempting login for:', email)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('[Login] Error:', error.message)

            if (error.message.includes('Invalid login credentials')) {
                return { success: false, error: 'Email atau password salah' }
            }
            if (error.message.includes('Email not confirmed')) {
                return { success: false, error: 'Email belum dikonfirmasi. Silakan cek email Anda.' }
            }
            return { success: false, error: error.message }
        }

        console.log('[Login] Success, user ID:', data.user?.id)

        // Get user profile to determine redirect
        let userRole = 'customer'

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profileError) {
                console.log('[Login] Profile fetch error:', profileError.message)
            } else {
                userRole = profile?.role || 'customer'
            }
        } catch (e) {
            console.log('[Login] Profile fetch exception:', e)
        }

        revalidatePath('/', 'layout')

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: userRole,
            },
        }
    } catch (err) {
        console.error('[Login] Unexpected error:', err)
        return { success: false, error: 'Terjadi kesalahan sistem' }
    }
}

/**
 * Register new user
 */
export async function register(formData: FormData): Promise<AuthResult> {
    try {
        const supabase = await createServerSupabase()

        const fullName = formData.get('fullName') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const password = formData.get('password') as string
        const role = (formData.get('role') as string) || 'customer'

        console.log('[Register] Starting registration for:', email)
        console.log('[Register] Role:', role)

        if (!fullName || !email || !password) {
            return { success: false, error: 'Nama, email, dan password harus diisi' }
        }

        if (password.length < 6) {
            return { success: false, error: 'Password minimal 6 karakter' }
        }

        // Check Supabase connection first
        console.log('[Register] Checking Supabase connection...')
        const { data: connectionTest } = await supabase.from('profiles').select('id').limit(1)
        console.log('[Register] Connection test result:', connectionTest)

        console.log('[Register] Attempting signUp...')

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: role,
                },
            },
        })

        console.log('[Register] signUp response - data:', data)
        console.log('[Register] signUp response - error:', error)

        if (error) {
            console.error('[Register] SignUp error:', error.message, error.status)

            if (error.message.includes('already registered') || error.message.includes('already exists')) {
                return { success: false, error: 'Email sudah terdaftar. Silakan login.' }
            }
            if (error.message.includes('Invalid email')) {
                return { success: false, error: 'Format email tidak valid' }
            }
            return { success: false, error: error.message }
        }

        // If user is created but email confirmation is required
        if (data.user && !data.session) {
            console.log('[Register] User created, needs email confirmation')
            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: role,
                },
            }
        }

        // If session is created immediately (email confirmation disabled)
        if (data.user && data.session) {
            console.log('[Register] User created with session, updating profile...')

            // Update profile with role if needed
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    phone: phone,
                    role: role,
                })

            if (upsertError) {
                console.error('[Register] Profile upsert error:', upsertError.message)
            } else {
                console.log('[Register] Profile upserted successfully')
            }
        }

        revalidatePath('/', 'layout')

        return {
            success: true,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                role: role,
            },
        }
    } catch (err) {
        console.error('[Register] Unexpected error:', err)
        return { success: false, error: 'Terjadi kesalahan sistem: ' + (err instanceof Error ? err.message : 'Unknown error') }
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    try {
        const supabase = await createServerSupabase()
        await supabase.auth.signOut()
        revalidatePath('/', 'layout')
    } catch (err) {
        console.error('[Logout] Error:', err)
    }
    redirect('/login')
}

/**
 * Get current session
 */
export async function getSession() {
    try {
        const supabase = await createServerSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        return session
    } catch (err) {
        console.error('[GetSession] Error:', err)
        return null
    }
}

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return null
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return {
            ...user,
            profile,
        }
    } catch (err) {
        console.error('[GetCurrentUser] Error:', err)
        return null
    }
}
