import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUserProfile } from '@/lib/supabase/server'

export default async function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await getUserProfile()

    if (!profile) {
        redirect('/login')
    }

    const role = (profile.role as 'owner' | 'employee' | 'customer') || 'customer'

    return (
        <DashboardLayout
            role={role}
            userName={profile.full_name || profile.email}
        >
            {children}
        </DashboardLayout>
    )
}