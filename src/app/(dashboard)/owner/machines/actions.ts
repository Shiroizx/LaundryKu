'use server'
import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMachineAction(data: {
    machine_number: string
    machine_type: string
    brand?: string | null
    capacity_kg?: number | null
    price_per_kg: number
}) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('machines')
            .insert({
                machine_number: data.machine_number,
                machine_type: data.machine_type,
                brand: data.brand || null,
                capacity_kg: data.capacity_kg || null,
                price_per_kg: data.price_per_kg,
                status: 'available',
            })
            
        if (error) throw error
        
        revalidatePath('/owner/machines')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateMachineAction(id: string, data: {
    machine_number?: string
    machine_type?: 'washing_machine' | 'dryer' | 'iron'
    brand?: string | null
    capacity_kg?: number | null
    price_per_kg?: number
    status?: 'available' | 'in_use' | 'maintenance'
}) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('machines')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            
        if (error) throw error
        
        revalidatePath('/owner/machines')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteMachineAction(id: string) {
    try {
        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('machines')
            .delete()
            .eq('id', id)
            
        if (error) throw error
        
        revalidatePath('/owner/machines')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
