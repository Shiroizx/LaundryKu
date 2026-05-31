import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { CustomerBookingsClient } from './customer-bookings-client'

export const metadata = {
    title: 'Booking Mesin - LaundryKu',
    description: 'Booking mesin cuci mandiri',
}

export default async function CustomerMachineBookingPage() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Silakan login kembali untuk melakukan booking mesin.</p>
            </div>
        )
    }

    const supabase = await createServerSupabase()

    // Fetch initial machines
    const { data: machines, error } = await supabase
        .from('machines')
        .select('*')
        .order('machine_number', { ascending: true })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Gagal memuat data mesin: {error.message}</p>
            </div>
        )
    }

    return <CustomerBookingsClient initialMachines={machines || []} />
}
