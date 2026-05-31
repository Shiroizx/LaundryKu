'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
    id: string
    title: string
    description?: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

function generateId(): string {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 9)
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId()
        const newToast = { ...toast, id }

        setToasts((prev) => [...prev, newToast])

        // Auto remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)

    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }

    return context
}

/**
 * Convenience hooks for common toast types
 */
export function useSuccessToast() {
    const { addToast } = useToast()

    return (title: string, description?: string) => {
        addToast({ title, description, type: 'success' })
    }
}

export function useErrorToast() {
    const { addToast } = useToast()

    return (title: string, description?: string) => {
        addToast({ title, description, type: 'error' })
    }
}

export function useWarningToast() {
    const { addToast } = useToast()

    return (title: string, description?: string) => {
        addToast({ title, description, type: 'warning' })
    }
}

export function useInfoToast() {
    const { addToast } = useToast()

    return (title: string, description?: string) => {
        addToast({ title, description, type: 'info' })
    }
}