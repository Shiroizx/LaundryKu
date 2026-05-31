// Order status configuration
export const ORDER_STATUS_CONFIG = {
    pending: {
        label: 'Menunggu',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'clock',
        description: 'Pesanan menunggu konfirmasi',
        nextStatuses: ['confirmed', 'cancelled'],
    },
    confirmed: {
        label: 'Dikonfirmasi',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'check-circle',
        description: 'Pesanan telah dikonfirmasi',
        nextStatuses: ['in_progress', 'cancelled'],
    },
    in_progress: {
        label: 'Sedang Diproses',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: 'loader',
        description: 'Pesanan sedang diproses',
        nextStatuses: ['washing', 'ready', 'cancelled'],
    },
    washing: {
        label: 'Mencuci',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        icon: 'droplet',
        description: 'Cucian sedang dicuci',
        nextStatuses: ['drying', 'ready', 'cancelled'],
    },
    drying: {
        label: 'Mengeringkan',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: 'sun',
        description: 'Cucian sedang dikeringkan',
        nextStatuses: ['ironing', 'ready', 'cancelled'],
    },
    ironing: {
        label: 'Menyetrika',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: 'iron',
        description: 'Cucian sedang disetrika',
        nextStatuses: ['ready', 'cancelled'],
    },
    ready: {
        label: 'Siap Diambil',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: 'package',
        description: 'Cucian siap untuk diambil',
        nextStatuses: ['completed'],
    },
    completed: {
        label: 'Selesai',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: 'check-double',
        description: 'Pesanan telah selesai',
        nextStatuses: [],
    },
    cancelled: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: 'x-circle',
        description: 'Pesanan dibatalkan',
        nextStatuses: [],
    },
} as const

export const ORDER_STATUS_STEPS = [
    'pending',
    'confirmed',
    'in_progress',
    'washing',
    'drying',
    'ironing',
    'ready',
    'completed',
] as const

export type OrderStatusKey = keyof typeof ORDER_STATUS_CONFIG

// Machine status configuration
export const MACHINE_STATUS_CONFIG = {
    available: {
        label: 'Tersedia',
        color: 'bg-green-500',
        bgColor: 'bg-green-50 border-green-200',
        icon: 'check-circle',
    },
    in_use: {
        label: 'Digunakan',
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: 'loader',
    },
    maintenance: {
        label: 'Perawatan',
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: 'tool',
    },
    broken: {
        label: 'Rusak',
        color: 'bg-red-500',
        bgColor: 'bg-red-50 border-red-200',
        icon: 'alert-triangle',
    },
} as const

export type MachineStatusKey = keyof typeof MACHINE_STATUS_CONFIG

// Payment status configuration
export const PAYMENT_STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Pembayaran',
        color: 'bg-yellow-100 text-yellow-800',
    },
    paid: {
        label: 'Lunas',
        color: 'bg-green-100 text-green-800',
    },
    failed: {
        label: 'Gagal',
        color: 'bg-red-100 text-red-800',
    },
    refunded: {
        label: 'Dikembalikan',
        color: 'bg-purple-100 text-purple-800',
    },
} as const

export type PaymentStatusKey = keyof typeof PAYMENT_STATUS_CONFIG

// Payment methods
export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tunai', icon: 'banknotes' },
    { value: 'ewallet', label: 'E-Wallet', icon: 'smartphone' },
    { value: 'bank_transfer', label: 'Transfer Bank', icon: 'building-columns' },
    { value: 'qris', label: 'QRIS', icon: 'qr-code' },
] as const

export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]['value']

// Machine types
export const MACHINE_TYPES = [
    { value: 'washing', label: 'Mesin Cuci', icon: 'waves' },
    { value: 'drying', label: 'Mesin Pengering', icon: 'sun' },
    { value: 'ironing', label: 'Setrika', icon: 'iron' },
    { value: 'combo', label: 'Kombinasi', icon: 'layers' },
] as const

export type MachineTypeKey = (typeof MACHINE_TYPES)[number]['value']

// Service types
export const SERVICE_TYPES = [
    { value: 'wash', label: 'Cuci', description: 'Layanan cuci biasa' },
    { value: 'dry', label: 'Kering', description: 'Layanan pengeringan' },
    { value: 'iron', label: 'Setrika', description: 'Layanan penyetrikaan' },
    { value: 'full_service', label: 'Lengkap', description: 'Layanan lengkap' },
] as const

export type ServiceTypeKey = (typeof SERVICE_TYPES)[number]['value']