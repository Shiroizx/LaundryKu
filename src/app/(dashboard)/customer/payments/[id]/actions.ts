'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function submitPaymentProof(prevState: any, formData: FormData) {
    const booking_id = formData.get('booking_id') as string
    const booking_code = formData.get('booking_code') as string
    const amount = formData.get('amount') as string
    const selectedMethodId = formData.get('selectedMethodId') as string
    const proofFile = formData.get('proofFile') as File | null
    const is_qris = formData.get('is_qris') === 'true'

    if (!booking_id || !selectedMethodId) {
        return { error: 'Data tidak lengkap' }
    }

    try {
        const supabase = await createServerSupabase()
        
        let proof_url = null
        let payment_code = null
        let methodType = 'bank_transfer' // default

        if (selectedMethodId === 'on_site') {
            // Bayar di Tempat
            methodType = 'cash'
            payment_code = 'PAY-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        } else {
            // Bank/QRIS - Require proof
            if (!proofFile || proofFile.size === 0) {
                return { error: 'Harap unggah foto bukti transfer' }
            }
            
            // Validate size (max 2MB)
            if (proofFile.size > 2 * 1024 * 1024) {
                return { error: 'Ukuran foto maksimal 2MB' }
            }

            methodType = is_qris ? 'e_wallet' : 'bank_transfer'

            // Upload proof
            const fileExt = proofFile.name.split('.').pop()
            const fileName = `proof_${booking_id}_${Math.random().toString(36).substring(2)}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
                .from('payment_proofs')
                .upload(fileName, proofFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)
            proof_url = data.publicUrl
        }

        // Insert pending payment
        const { error: payError } = await supabase.from('payments').insert({
            booking_id: booking_id,
            amount: parseFloat(amount),
            method: methodType,
            status: 'pending',
            proof_url: proof_url,
            payment_code: payment_code
        } as any)

        if (payError) throw payError

        return { 
            success: true, 
            payment_code: payment_code 
        }
    } catch (err: any) {
        console.error('Failed to submit payment:', err)
        return { error: err.message || 'Gagal mengirim pembayaran' }
    }
}
