/**
 * Supabase Database Types
 * 
 * These types are generated from the Supabase schema.
 * In production, use `npx supabase gen types typescript` to generate.
 */

// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'customer' | 'employee' | 'owner'
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'ewallet' | 'bank_transfer' | 'qris'
export type MachineStatus = 'available' | 'in_use' | 'maintenance' | 'broken'
export type MachineType = 'washing' | 'drying' | 'ironing' | 'combo'
export type BookingStatus = 'reserved' | 'in_use' | 'completed' | 'cancelled' | 'no_show'

// ============================================================
// TABLES
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

export interface Employee {
    id: string
    user_id: string | null
    employee_code: string
    full_name: string
    phone: string | null
    address: string | null
    position: string
    hourly_rate: number
    is_active: boolean
    hire_date: string | null
    created_at: string
    updated_at: string
}

export interface Machine {
    id: string
    name: string
    machine_type: MachineType
    brand: string | null
    capacity_kg: number
    status: MachineStatus
    is_active: boolean
    hourly_rate: number
    created_at: string
    updated_at: string
}

export interface MachineSchedule {
    id: string
    machine_id: string
    date: string
    start_time: string
    end_time: string
    status: BookingStatus
    created_at: string
}

export interface Shift {
    id: string
    employee_id: string
    date: string
    start_time: string
    end_time: string
    shift_name: string | null
    is_active: boolean
    created_at: string
}

export interface Service {
    id: string
    name: string
    description: string | null
    service_type: string
    price_per_kg: number
    price_per_item: number | null
    duration_hours: number | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Order {
    id: string
    order_number: string
    customer_id: string
    employee_id: string | null
    service_id: string
    status: OrderStatus
    weight_kg: number | null
    item_count: number | null
    special_instructions: string | null
    pickup_address: string | null
    delivery_address: string | null
    pickup_time: string | null
    estimated_completion: string | null
    actual_completion: string | null
    subtotal: number
    discount: number
    total_amount: number
    qr_code: string
    created_at: string
    updated_at: string
}

export interface OrderStatusHistory {
    id: string
    order_id: string
    status: OrderStatus
    notes: string | null
    updated_by: string | null
    updated_at: string
}

export interface MachineBooking {
    id: string
    booking_number: string
    customer_id: string
    machine_id: string
    schedule_id: string | null
    date: string
    start_time: string
    end_time: string
    status: BookingStatus
    total_amount: number
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Payment {
    id: string
    payment_number: string
    order_id: string | null
    booking_id: string | null
    customer_id: string
    amount: number
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_date: string | null
    transaction_id: string | null
    snap_token: string | null
    payment_url: string | null
    metadata: Record<string, unknown> | null
    created_at: string
    updated_at: string
}

export interface Review {
    id: string
    order_id: string
    customer_id: string
    rating: number
    comment: string | null
    created_at: string
}

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    is_read: boolean
    link: string | null
    created_at: string
}

export interface Setting {
    id: string
    key: string
    value: Record<string, unknown>
    description: string | null
    updated_at: string
}

// ============================================================
// DATABASE TYPE FOR SUPABASE CLIENT
// ============================================================

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>
            }
            employees: {
                Row: Employee
                Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Employee, 'id' | 'created_at'>>
            }
            machines: {
                Row: Machine
                Insert: Omit<Machine, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Machine, 'id' | 'created_at'>>
            }
            machine_schedules: {
                Row: MachineSchedule
                Insert: Omit<MachineSchedule, 'id' | 'created_at'>
                Update: Partial<Omit<MachineSchedule, 'id' | 'created_at'>>
            }
            shifts: {
                Row: Shift
                Insert: Omit<Shift, 'id' | 'created_at'>
                Update: Partial<Omit<Shift, 'id' | 'created_at'>>
            }
            services: {
                Row: Service
                Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Service, 'id' | 'created_at'>>
            }
            orders: {
                Row: Order
                Insert: Omit<Order, 'id' | 'order_number' | 'qr_code' | 'created_at' | 'updated_at' | 'subtotal' | 'discount' | 'total_amount'>
                Update: Partial<Omit<Order, 'id' | 'order_number' | 'qr_code' | 'created_at'>>
            }
            bookings: {
                Row: {
                    id: string
                    booking_code: string
                    user_id: string
                    employee_id: string | null
                    service_type: string
                    status: string
                    weight_kg: number | null
                    notes: string | null
                    pickup_time: string | null
                    total_amount: number
                    qr_code: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    booking_code: string
                    user_id: string
                    employee_id?: string | null
                    service_type: string
                    status?: string
                    weight_kg?: number | null
                    notes?: string | null
                    pickup_time?: string | null
                    total_amount: number
                    qr_code?: string | null
                }
                Update: {
                    booking_code?: string
                    user_id?: string
                    employee_id?: string | null
                    service_type?: string
                    status?: string
                    weight_kg?: number | null
                    notes?: string | null
                    pickup_time?: string | null
                    total_amount?: number
                    qr_code?: string | null
                    updated_at?: string
                }
            }
            order_status_history: {
                Row: OrderStatusHistory
                Insert: Omit<OrderStatusHistory, 'id' | 'updated_at'>
                Update: Partial<Omit<OrderStatusHistory, 'id' | 'updated_at'>>
            }
            machine_bookings: {
                Row: MachineBooking
                Insert: Omit<MachineBooking, 'id' | 'booking_number' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<MachineBooking, 'id' | 'booking_number' | 'created_at'>>
            }
            payments: {
                Row: Payment
                Insert: Omit<Payment, 'id' | 'payment_number' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Payment, 'id' | 'payment_number' | 'created_at'>>
            }
            reviews: {
                Row: Review
                Insert: Omit<Review, 'id' | 'created_at'>
                Update: Partial<Omit<Review, 'id' | 'created_at'>>
            }
            notifications: {
                Row: Notification
                Insert: Omit<Notification, 'id' | 'created_at'>
                Update: Partial<Omit<Notification, 'id' | 'created_at'>>
            }
            settings: {
                Row: Setting
                Insert: Omit<Setting, 'id' | 'updated_at'>
                Update: Partial<Omit<Setting, 'id' | 'updated_at'>>
            }
        }
        Views: Record<string, never>
        Functions: {
            get_user_role: {
                Args: Record<string, never>
                Returns: UserRole
            }
        }
        Enums: {
            user_role: UserRole
            order_status: OrderStatus
            payment_status: PaymentStatus
            payment_method: PaymentMethod
            machine_status: MachineStatus
            machine_type: MachineType
            booking_status: BookingStatus
        }
    }
}

// ============================================================
// RELATIONSHIP TYPES (with joined data)
// ============================================================

export interface OrderWithRelations extends Order {
    customer: Profile
    employee: Employee | null
    service: Service
    status_history: OrderStatusHistory[]
}

export interface OrderWithCustomer extends Order {
    customer: Profile
    service: Service
}

export interface OrderWithEmployee extends Order {
    employee: Employee
    service: Service
}

export interface PaymentWithDetails extends Payment {
    order: Order | null
    customer: Profile
}

export interface MachineBookingWithMachine extends MachineBooking {
    machine: Machine
}

export interface ShiftWithEmployee extends Shift {
    employee: Employee
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
    data: T | null
    error: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

// ============================================================
// FORM TYPES
// ============================================================

export interface CreateOrderInput {
    service_id: string
    weight_kg?: number
    item_count?: number
    special_instructions?: string
    pickup_address?: string
    delivery_address?: string
    pickup_time?: string
}

export interface CreateBookingInput {
    machine_id: string
    date: string
    start_time: string
    end_time: string
    notes?: string
}

export interface CreatePaymentInput {
    order_id?: string
    booking_id?: string
    amount: number
    payment_method: PaymentMethod
}

export interface UpdateOrderStatusInput {
    order_id: string
    status: OrderStatus
    notes?: string
}

export interface RegisterInput {
    email: string
    password: string
    full_name: string
    phone?: string
    role?: UserRole
}