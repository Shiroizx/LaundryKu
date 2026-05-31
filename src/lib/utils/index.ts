import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind CSS classes
 * Usage: cn("px-2 py-1", isActive && "bg-blue-500", "text-white")
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
    
    return `Rp${formatted}`
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        ...options,
    }).format(new Date(date))
}

/**
 * Format time to Indonesian format
 */
export function formatTime(date: string | Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })

    if (diffSec < 60) return rtf.format(-diffSec, 'second')
    if (diffMin < 60) return rtf.format(-diffMin, 'minute')
    if (diffHour < 24) return rtf.format(-diffHour, 'hour')
    if (diffDay < 7) return rtf.format(-diffDay, 'day')

    return formatDate(date)
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${dateStr}-${random}`
}

/**
 * Generate unique booking number
 */
export function generateBookingNumber(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `BKG-${dateStr}-${random}`
}

/**
 * Generate unique payment number
 */
export function generatePaymentNumber(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PAY-${dateStr}-${random}`
}

/**
 * Generate unique employee code
 */
export function generateEmployeeCode(): string {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const timestamp = Date.now().toString(36).substring(-4).toUpperCase()
    return `EMP-${random}${timestamp}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}

/**
 * Convert to slug
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Calculate estimated completion time
 */
export function calculateEstimatedCompletion(
    startTime: Date,
    durationHours: number
): Date {
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + durationHours)
    return endTime
}

/**
 * Get status color for order status
 */
export function getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-purple-100 text-purple-800',
        washing: 'bg-cyan-100 text-cyan-800',
        drying: 'bg-orange-100 text-orange-800',
        ironing: 'bg-indigo-100 text-indigo-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-emerald-100 text-emerald-800',
        cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label for order status
 */
export function getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        confirmed: 'Dikonfirmasi',
        in_progress: 'Sedang Diproses',
        washing: 'Mencuci',
        drying: 'Mengeringkan',
        ironing: 'Menyetrika',
        ready: 'Siap Diambil',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
    }
    return labels[status] || status
}

/**
 * Get machine status color
 */
export function getMachineStatusColor(status: string): string {
    const colors: Record<string, string> = {
        available: 'bg-green-500',
        in_use: 'bg-yellow-500',
        maintenance: 'bg-orange-500',
        broken: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
}

/**
 * Get machine status label
 */
export function getMachineStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        available: 'Tersedia',
        in_use: 'Digunakan',
        maintenance: 'Perawatan',
        broken: 'Rusak',
    }
    return labels[status] || status
}