import { createServerSupabase } from '@/lib/supabase/server'
import { getEmployeeOrdersHistory } from '@/app/actions/employee'
import { DashboardPage, DashboardSection } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { BOOKING_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/supabase/database-types'
import type { BookingWithCustomer } from '@/hooks/use-employee-dashboard'
import type { BookingStatus } from '@/lib/supabase/database-types'
import { redirect } from 'next/navigation'
import { OrdersClient } from './orders-client'

type BadgeVariant = NonNullable<BadgeProps['variant']>
const badgeVariantMap: Record<string, BadgeVariant> = {
    warning: 'warning',
    cyan: 'cyan',
    indigo: 'indigo',
    success: 'success',
    emerald: 'emerald',
    danger: 'danger',
    default: 'default',
}

export default async function OrdersPage() {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const data = await getEmployeeOrdersHistory(user.id)
    const orders = (data || []) as BookingWithCustomer[]

    return (
        <DashboardPage>
            <DashboardSection title="Riwayat Pesanan Masuk" subtitle="Semua pesanan yang pernah ditugaskan kepada Anda">
                <Card>
                    <CardContent className="p-0">
                        <OrdersClient orders={orders} />
                    </CardContent>
                </Card>
            </DashboardSection>
        </DashboardPage>
    )
}
