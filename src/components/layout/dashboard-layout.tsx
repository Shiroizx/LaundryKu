'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { HeaderWithNotifications } from '@/components/layout/header'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    isRead: boolean
}

interface DashboardLayoutProps {
    children: React.ReactNode
    role: 'owner' | 'employee' | 'customer'
    userName?: string
    notifications?: Notification[]
    onNotificationClick?: (notification: Notification) => void
    headerActions?: React.ReactNode
}

export function DashboardLayout({
    children,
    role,
    userName,
    notifications = [],
    onNotificationClick,
    headerActions,
}: DashboardLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    const getTitle = () => {
        switch (role) {
            case 'owner':
                return 'Dashboard Owner'
            case 'employee':
                return 'Dashboard Karyawan'
            case 'customer':
                return 'Dashboard Pelanggan'
            default:
                return 'Dashboard'
        }
    }

    const getSubtitle = () => {
        const now = new Date()
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        return now.toLocaleDateString('id-ID', options)
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Soft decorative background orbs for modern aesthetic */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[600px] bg-gradient-to-br from-cyan-100/40 to-emerald-50/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Sidebar */}
            <Sidebar 
                role={role} 
                userName={userName} 
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content */}
            <div className={cn(
                'transition-all duration-300 relative z-10',
                isCollapsed ? 'md:ml-20' : 'md:ml-64'
            )}>
                {/* Header */}
                <HeaderWithNotifications
                    title={getTitle()}
                    subtitle={getSubtitle()}
                    notifications={notifications}
                    onNotificationClick={onNotificationClick}
                    actions={headerActions}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />

                {/* Page Content with Animations */}
                <main className="p-4 md:p-8 min-h-[calc(100vh-80px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

// Page wrapper for dashboard pages
export function DashboardPage({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('space-y-8', className)}>
            {children}
        </div>
    )
}

// Section wrapper
export function DashboardSection({ title, subtitle, children, actions, className }: {
    title: string
    subtitle?: string
    children: React.ReactNode
    actions?: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('space-y-5', className)}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            {children}
        </div>
    )
}