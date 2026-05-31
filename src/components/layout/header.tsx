'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface HeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
    showSearch?: boolean
    searchPlaceholder?: string
    onSearch?: (value: string) => void
    onMenuClick?: () => void
}

export function Header({ title, subtitle, actions, showSearch, searchPlaceholder = 'Pencarian...', onSearch, onMenuClick }: HeaderProps) {
    const [searchValue, setSearchValue] = useState('')

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
        onSearch?.(e.target.value)
    }

    return (
        <header className="sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between px-4 md:px-6 h-full">
                <div className="flex items-center gap-3">
                    {onMenuClick && (
                        <button 
                            onClick={onMenuClick}
                            className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h1>
                        {subtitle && <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5 md:mt-1">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {showSearch && (
                        <div className="relative group">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={handleSearch}
                                placeholder={searchPlaceholder}
                                className="h-10 pl-10 pr-4 w-64 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all text-slate-700 placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                    )}
                    {actions}
                </div>
            </div>
        </header>
    )
}

interface Notification {
    id: string
    title: string
    message: string
    time: string
    isRead: boolean
}

interface HeaderWithNotificationsProps extends HeaderProps {
    notifications?: Notification[]
    onNotificationClick?: (notification: Notification) => void
}

export function HeaderWithNotifications({ notifications = [], onNotificationClick, ...props }: HeaderWithNotificationsProps) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <Header
            {...props}
            actions={
                <>
                    {props.actions}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-cyan-600 transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800">Notifikasi</h3>
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-400">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                </div>
                                                <p className="font-medium">Belum ada notifikasi</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {notifications.map((notification) => (
                                                    <button
                                                        key={notification.id}
                                                        onClick={() => {
                                                            onNotificationClick?.(notification)
                                                            setIsNotificationOpen(false)
                                                        }}
                                                        className={cn( 'w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors', !notification.isRead && 'bg-cyan-50/30' )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn( 'w-2 h-2 mt-2 rounded-full shrink-0', notification.isRead ? 'bg-slate-200' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                                                            )} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-sm font-semibold", notification.isRead ? "text-slate-600" : "text-slate-900")}>{notification.title}</p>
                                                                <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{notification.message}</p>
                                                                <p className="text-xs font-medium text-slate-400 mt-2">{notification.time}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            }
        />
    )
}