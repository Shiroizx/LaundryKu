import { createServerSupabase } from '@/lib/supabase/server'
import { getEmployeeBookings } from '@/app/actions/employee'
import { EmployeeQueueClient } from './employee-queue-client'
import { redirect } from 'next/navigation'

export default async function QueuePage() {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const dashboardData = await getEmployeeBookings(user.id)
    const todayBookings = dashboardData.todayData || []

    return <EmployeeQueueClient initialBookings={todayBookings} employeeId={user.id} />
}
