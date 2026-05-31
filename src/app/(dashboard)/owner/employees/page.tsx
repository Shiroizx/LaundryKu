import { createServerSupabase } from '@/lib/supabase/server'
import OwnerEmployeesClient from './owner-employees-client'

export default async function OwnerEmployeesPage() {
    const supabase = await createServerSupabase()
    
    // Fetch employees
    const { data: empData } = await supabase
        .from('employees')
        .select(`
            *,
            profile:profiles!user_id(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

    return <OwnerEmployeesClient initialEmployees={empData || []} />
}
