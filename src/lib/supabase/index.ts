/**
 * Central exports for Supabase utilities
 */

// Client (Browser)
export { getSupabaseBrowserClient, getSupabaseBrowserClientSingleton } from './client'

// Server (Server Components, Route Handlers)
export {
    createServerSupabase,
    getAuthenticatedUser,
    getUserProfile,
    getSession,
    getUserRole,
    hasRole,
    requireAuth,
    requireRole,
} from './server'

// Server Actions
export {
    getSupabaseActionClient,
    dbAction,
    authAction,
    authProfileAction,
    requireRoleAction,
} from './actions'

// Middleware
export { updateSession } from './middleware'

// Types
export type {
    Database,
    UserRole,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    MachineStatus,
    MachineType,
    BookingStatus,
    Profile,
    Employee,
    Machine,
    MachineSchedule,
    Shift,
    Service,
    Order,
    OrderStatusHistory,
    MachineBooking,
    Payment,
    Review,
    Notification,
    Setting,
    OrderWithRelations,
    OrderWithCustomer,
    OrderWithEmployee,
    PaymentWithDetails,
    MachineBookingWithMachine,
    ShiftWithEmployee,
    ApiResponse,
    PaginatedResponse,
    CreateOrderInput,
    CreateBookingInput,
    CreatePaymentInput,
    UpdateOrderStatusInput,
    RegisterInput,
} from './types'