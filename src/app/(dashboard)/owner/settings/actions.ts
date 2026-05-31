'use server'
import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPaymentMethodAction(formData: FormData) {
    try {
        const supabase = await createServerSupabase()
        
        const bankName = formData.get('bankName') as string
        const accountNumber = formData.get('accountNumber') as string
        const accountName = formData.get('accountName') as string
        const isQris = formData.get('isQris') === 'true'
        const qrisFile = formData.get('qrisFile') as File | null
        
        let qris_image_url = null
        
        if (isQris && qrisFile && qrisFile.size > 0) {
            const fileExt = qrisFile.name.split('.').pop()
            const fileName = `qris_${Math.random().toString(36).substring(2)}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('payment_proofs')
                .upload(fileName, qrisFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)
            qris_image_url = data.publicUrl
        }

        const { data, error } = await supabase.from('store_payment_methods').insert({
            bank_name: bankName,
            account_number: accountNumber,
            account_name: accountName,
            is_qris: isQris,
            qris_image_url,
            is_active: true
        } as any).select().single()

        if (error) throw error

        revalidatePath('/owner/settings')
        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deletePaymentMethodAction(id: string) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase.from('store_payment_methods').delete().eq('id', id)
        
        if (error) throw error
        
        revalidatePath('/owner/settings')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
