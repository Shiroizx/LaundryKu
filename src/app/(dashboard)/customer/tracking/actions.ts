'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function searchBooking(prevState: any, formData: FormData) {
    const code = formData.get('code') as string
    if (!code) return { error: 'Silakan masukkan kode pesanan' }

    const supabase = await createServerSupabase()
    const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .ilike('booking_code', code.trim())
        .single()

    if (error || !data) {
        return { error: 'Pesanan tidak ditemukan. Periksa kembali kode pesanan Anda.' }
    }

    redirect(`/customer/track/${data.id}`)
}
