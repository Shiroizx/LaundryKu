'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { createEmployeeAccountAction, updateEmployeeAccountAction } from '@/app/actions/owner'

interface EmployeeRow {
    id: string
    user_id: string | null
    employee_code: string
    position: string
    shift: 'morning' | 'afternoon' | 'night' | null
    hourly_rate: number
    is_active: boolean
    hire_date: string | null
    created_at: string
    updated_at: string
    profile?: {
        id: string
        full_name: string
        email: string
        phone: string | null
    }
}

interface MachineRow {
    id: string
    machine_number: string
    machine_type: 'washing_machine' | 'dryer' | 'iron'
    brand: string | null
    capacity_kg: number | null
    price_per_kg: number
    status: 'available' | 'in_use' | 'maintenance'
    created_at: string
    updated_at: string
}

interface ProfileRow {
    id: string
    full_name: string
    email: string
    phone: string | null
    role: string
}

/**
 * Hook for managing employees (Owner CRUD)
 */
export function useEmployeeManagement() {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])

    const [employees, setEmployees] = useState<EmployeeRow[]>([])
    const [availableProfiles, setAvailableProfiles] = useState<ProfileRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refresh = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true)
        setError(null)
        try {
            // Fetch employees
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select(`
                    *,
                    profile:profiles!user_id(id, full_name, email, phone)
                `)
                .order('created_at', { ascending: false })

            if (empError) throw empError

            // Fetch available profiles
            const { data: profData, error: profError } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, role')
                .eq('role', 'employee')

            if (profError) throw profError

            const existingUserIds = new Set((empData || []).map((e: any) => e.user_id))
            const filteredProfiles = ((profData || []) as ProfileRow[]).filter(p => !existingUserIds.has(p.id))

            setEmployees((empData || []) as EmployeeRow[])
            setAvailableProfiles(filteredProfiles)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            if (showLoader) setIsLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        refresh(true)
    }, [refresh])

    const addEmployee = async (data: {
        fullName: string
        email: string
        password?: string
        employeeCode: string
        position: string
        hourlyRate?: number
        hireDate?: string | null
    }) => {
        const result = await createEmployeeAccountAction({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            employeeCode: data.employeeCode,
            position: data.position,
            hourlyRate: data.hourlyRate || 0,
            hireDate: data.hireDate || null
        })

        if (!result.success) {
            throw new Error(result.error)
        }
        
        await refresh(false)
    }

    const updateEmployee = async (id: string, data: {
        userId?: string
        fullName?: string
        email?: string
        password?: string
        employeeCode?: string
        position?: string
        hourlyRate?: number
        is_active?: boolean
        hireDate?: string | null
    }) => {
        // Jika parameter yang dikirim adalah is_active (dari toggleActive), gunakan Supabase update biasa (optimistic)
        if (data.is_active !== undefined && Object.keys(data).length === 1) {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, is_active: data.is_active! } : e))
            try {
                const { error } = await supabase
                    .from('employees')
                    .update({ is_active: data.is_active, updated_at: new Date().toISOString() })
                    .eq('id', id)
                if (error) throw error
                refresh(false)
            } catch (err) {
                await refresh(false)
                throw err
            }
            return
        }

        // Jika mengupdate data lengkap (dari modal Edit)
        const result = await updateEmployeeAccountAction({
            employeeId: id,
            userId: data.userId!,
            fullName: data.fullName!,
            email: data.email!,
            password: data.password,
            employeeCode: data.employeeCode!,
            position: data.position!,
            hourlyRate: data.hourlyRate || 0,
            hireDate: data.hireDate || null
        })

        if (!result.success) {
            throw new Error(result.error)
        }
        
        await refresh(false)
    }

    const deleteEmployee = async (id: string) => {
        // Optimistic update
        setEmployees(prev => prev.filter(e => e.id !== id))

        try {
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', id)

            if (error) throw error
            refresh(false) // Background sync
        } catch (err) {
            await refresh(false) // Revert on error
            throw err
        }
    }

    const toggleActive = async (id: string, isActive: boolean) => {
        await updateEmployee(id, { is_active: !isActive })
    }

    return {
        employees,
        availableProfiles,
        isLoading,
        error,
        refresh,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleActive,
    }
}

/**
 * Hook for managing machines (Owner CRUD)
 */
export function useMachineManagement() {
    const supabase = useMemo(() => getSupabaseBrowserClient() as any, [])

    const [machines, setMachines] = useState<MachineRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refresh = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('machines')
                .select('*')
                .order('machine_number', { ascending: true })

            if (error) throw error
            setMachines((data || []) as MachineRow[])
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            if (showLoader) setIsLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        refresh(true)
    }, [refresh])

    const addMachine = async (data: {
        machine_number: string
        machine_type: string
        brand?: string | null
        capacity_kg?: number | null
        price_per_kg: number
    }) => {
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

        if (error) {
            console.error('Insert Machine Error:', error)
            throw new Error(error.message || 'Gagal menyimpan data mesin ke database')
        }
        await refresh(false)
    }

    const updateMachine = async (id: string, data: {
        machine_number?: string
        machine_type?: 'washing_machine' | 'dryer' | 'iron'
        brand?: string | null
        capacity_kg?: number | null
        price_per_kg?: number
        status?: 'available' | 'in_use' | 'maintenance'
    }) => {
        // Optimistic update
        setMachines(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))

        try {
            const { error } = await supabase
                .from('machines')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
            refresh(false) // Background sync
        } catch (err) {
            await refresh(false) // Revert on error
            throw err
        }
    }

    const deleteMachine = async (id: string) => {
        // Optimistic update
        setMachines(prev => prev.filter(m => m.id !== id))

        try {
            const { error } = await supabase
                .from('machines')
                .delete()
                .eq('id', id)

            if (error) throw error
            refresh(false) // Background sync
        } catch (err) {
            await refresh(false) // Revert on error
            throw err
        }
    }

    const updateStatus = async (id: string, status: 'available' | 'in_use' | 'maintenance') => {
        await updateMachine(id, { status })
    }

    return {
        machines,
        isLoading,
        error,
        refresh,
        addMachine,
        updateMachine,
        deleteMachine,
        updateStatus,
    }
}
