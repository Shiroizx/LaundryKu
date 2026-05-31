import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerProfileClient } from './customer-profile-client'
import type { Profile } from '@/lib/supabase/database-types'

export const metadata = {
    title: 'Profil - LaundryKu',
    description: 'Kelola informasi profil Anda',
}

export default async function CustomerProfilePage() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melihat profil Anda.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError && profileError.code !== 'PGRST116') {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Gagal memuat profil: {profileError.message}</p>
            </div>
        )
    }

    const profile = profileData as Profile | null

    return <CustomerProfileClient initialProfile={profile} />
}
