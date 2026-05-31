import { createServerSupabase } from '@/lib/supabase/server'
import OwnerMachinesClient from './owner-machines-client'

export default async function OwnerMachinesPage() {
    const supabase = await createServerSupabase()
    
    const { data: machinesData } = await supabase
        .from('machines')
        .select(`
            *,
            machine_bookings(
                id,
                start_time,
                end_time,
                bookings(
                    id,
                    booking_code,
                    status,
                    customer:profiles(full_name, phone)
                )
            )
        `)
        .order('machine_number', { ascending: true })

    return <OwnerMachinesClient initialMachines={machinesData || []} />
}