import { createServerSupabase } from '@/lib/supabase/server'
import { getEmployeeBookings } from '@/app/actions/employee'
import { EmployeeDashboardClient } from './employee-dashboard-client'

export default async function EmployeeDashboard() {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Please login to view your dashboard</p>
                </div>
            </div>
        )
    }

    const userId = user.id

    // Fetch employee profile
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    // Fetch dashboard data via server action
    const dashboardData = await getEmployeeBookings(userId)
    
    const todayBookings = dashboardData.todayData || []
    const assignedBookings = dashboardData.assignedData || []

    // Computed stats
    const stats = {
        todayQueue: todayBookings.filter((b: any) => !['finished', 'picked_up', 'cancelled'].includes(b.status)).length,
        completedToday: todayBookings.filter((b: any) => ['finished', 'picked_up'].includes(b.status)).length,
        readyToPickup: todayBookings.filter((b: any) => b.status === 'finished').length,
        totalAssigned: assignedBookings.length,
    }

    return (
        <EmployeeDashboardClient 
            profile={profileData} 
            todayBookings={todayBookings} 
            assignedBookings={assignedBookings} 
            stats={stats} 
        />
    )
}