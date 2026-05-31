'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function updateProfile(prevState: any, formData: FormData) {
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const profile_id = formData.get('profile_id') as string

    if (!profile_id) {
        return { error: 'ID Profil tidak ditemukan' }
    }

    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('profiles')
            .update({ full_name, phone })
            .eq('id', profile_id)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('Failed to update profile:', err)
        return { error: 'Gagal menyimpan profil: ' + err.message }
    }
}
