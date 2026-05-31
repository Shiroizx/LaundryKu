'use client'

import { cn } from '@/lib/utils'
import { useState, createContext, useContext } from 'react'

interface TabsContextValue {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps {
    defaultValue: string
    children: React.ReactNode
    className?: string
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn( 'inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className )}>
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function TabsTrigger({ value, children, className, disabled = false }: TabsTriggerProps) {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabsTrigger must be used within Tabs')

    const { activeTab, setActiveTab } = context
    const isActive = activeTab === value

    return (
        <button
            onClick={() => setActiveTab(value)}
            disabled={disabled}
            className={cn( 'px-4 py-2 text-sm font-medium rounded-md transition-all', isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900', disabled && 'opacity-50 cursor-not-allowed', className )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabsContent must be used within Tabs')

    const { activeTab } = context

    if (activeTab !== value) return null

    return (
        <div className={cn('mt-4 animate-in fade-in slide-in-from-top-2 duration-200', className)}>
            {children}
        </div>
    )
}