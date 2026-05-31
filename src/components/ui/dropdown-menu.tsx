'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface DropdownItem {
    label: string
    value: string
    icon?: React.ReactNode
    danger?: boolean
    disabled?: boolean
}

interface DropdownMenuProps {
    trigger: React.ReactNode
    items: DropdownItem[]
    onSelect: (value: string) => void
    align?: 'left' | 'right'
    className?: string
}

export function DropdownMenu({ trigger, items, onSelect, align = 'right', className }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={dropdownRef} className={cn('relative inline-block', className)}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn( 'absolute z-50 mt-2 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-150', align === 'right' ? 'right-0' : 'left-0' )}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (!item.disabled) {
                                    onSelect(item.value)
                                    setIsOpen(false)
                                }
                            }}
                            disabled={item.disabled}
                            className={cn( 'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors', item.disabled ? 'opacity-50 cursor-not-allowed' : item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100' )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}