/**
 * Types that match the actual Supabase database schema
 * Source: SUPABASE_DATABASE.md - Section 3
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// ENUMS - sesuai dengan SQL database
// ============================================================

export type UserRole = 'customer' | 'employee' | 'owner'

export type BookingStatus =
    | 'pending'
    | 'washing'
    | 'ironing'
    | 'finished'
    | 'picked_up'
    | 'cancelled'

export type MachineStatus = 'available' | 'in_use' | 'maintenance'

export type MachineType = 'washing_machine' | 'dryer' | 'iron'

export type ServiceType = 'self_service' | 'full_service' | 'express'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'cash' | 'bank_transfer' | 'e_wallet'

// ============================================================
// TABLES - sesuai dengan actual database schema
// ============================================================

export interface Profile {
    id: string
    email: string
    full_name: string
    phone: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
    updated_at: string
}

export interface Machine {
    id: string
    machine_number: string
    machine_type: MachineType
    brand: string | null
    capacity_kg: number | null
    price_per_kg: number
    status: MachineStatus
    created_at: string
    updated_at: string
}

export interface Employee {
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
    // Joined data from profiles
    profile?: Profile
}

export interface Booking {
    id: string
    booking_code: string
    user_id: string
    employee_id: string | null
    service_type: ServiceType
    status: BookingStatus
    weight_kg: number | null
    notes: string | null
    pickup_time: string | null
    total_amount: number
    qr_code: string | null
    created_at: string
    updated_at: string
    // Joined data
    customer?: Profile
    employee?: Employee
}

export interface MachineBooking {
    id: string
    booking_id: string
    machine_id: string
    start_time: string
    end_time: string | null
    created_at: string
    // Joined data
    machine?: Machine
    booking?: Booking
}

export interface Payment {
    id: string
    booking_id: string
    amount: number
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: string | null
    proof_url: string | null
    payment_code: string | null
    paid_at: string | null
    created_at: string
    updated_at: string
}

export interface StorePaymentMethod {
    id: string
    bank_name: string
    account_number: string
    account_name: string
    is_qris: boolean
    qris_image_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

// ============================================================
// RELATIONSHIP TYPES
// ============================================================

export interface BookingWithRelations {
    id: string
    booking_code: string
    user_id: string
    employee_id: string | null
    service_type: ServiceType
    status: BookingStatus
    weight_kg: number | null
    notes: string | null
    pickup_time: string | null
    total_amount: number
    qr_code: string | null
    created_at: string
    updated_at: string
    customer: Profile
    employee: Employee | null
}

export interface MachineWithBookings extends Machine {
    machine_bookings?: MachineBooking[]
}

// ============================================================
// DASHBOARD STATS TYPES
// ============================================================

export interface OwnerDashboardStats {
    totalBookings: number
    activeBookings: number
    totalRevenue: number
    machinesAvailable: number
    machinesTotal: number
    employeesActive: number
}

// ============================================================
// STATUS LABEL CONFIG
// ============================================================

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; variant: string }> = {
    pending: { label: 'Menunggu', variant: 'warning' },
    washing: { label: 'Mencuci', variant: 'cyan' },
    ironing: { label: 'Menyetrika', variant: 'indigo' },
    finished: { label: 'Selesai', variant: 'success' },
    picked_up: { label: 'Sudah Diambil', variant: 'emerald' },
    cancelled: { label: 'Dibatalkan', variant: 'danger' },
}

export const MACHINE_STATUS_CONFIG: Record<MachineStatus, { label: string; variant: string }> = {
    available: { label: 'Tersedia', variant: 'success' },
    in_use: { label: 'Digunakan', variant: 'warning' },
    maintenance: { label: 'Perawatan', variant: 'orange' },
}

export const MACHINE_TYPE_CONFIG: Record<MachineType, { label: string }> = {
    washing_machine: { label: 'Mesin Cuci' },
    dryer: { label: 'Mesin Pengering' },
    iron: { label: 'Setrika' },
}

// ============================================================
// HELPERS
// ============================================================

export function formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
    return `Rp${formatted}`
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

// ============================================================
// SUPABASE QUERIES
// ============================================================

export async function fetchOwnerStats(supabase: SupabaseClient) {
    // Get total bookings this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

    const { count: activeBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '(finished,picked_up,cancelled)')

    // Get total revenue from payments
    const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_at', startOfMonth.toISOString())

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    // Get machines stats
    const { count: machinesAvailable } = await supabase
        .from('machines')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')

    const { count: machinesTotal } = await supabase
        .from('machines')
        .select('*', { count: 'exact', head: true })

    // Get active employees
    const { count: employeesActive } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

    return {
        totalBookings: totalBookings || 0,
        activeBookings: activeBookings || 0,
        totalRevenue,
        machinesAvailable: machinesAvailable || 0,
        machinesTotal: machinesTotal || 0,
        employeesActive: employeesActive || 0,
    }
}

export async function fetchRecentBookings(supabase: SupabaseClient, limit = 10) {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            customer:profiles!user_id(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data as BookingWithRelations[]
}

export async function fetchMachines(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('machine_number', { ascending: true })

    if (error) throw error
    return data as Machine[]
}

export async function fetchEmployees(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('employees')
        .select(`
            *,
            profile:profiles!user_id(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Employee[]
}

export async function fetchTodayBookings(supabase: SupabaseClient) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            customer:profiles!user_id(id, full_name, email, phone)
        `)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as BookingWithRelations[]
}

export async function fetchMachineBookings(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('machine_bookings')
        .select(`
            *,
            machine:machines(*),
            booking:bookings(*)
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

    if (error) throw error
    return data as (MachineBooking & { machine: Machine; booking: Booking })[]
}