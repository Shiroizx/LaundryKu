import { cn } from '@/lib/utils'

interface AlertProps {
    children: React.ReactNode
    variant?: 'info' | 'success' | 'warning' | 'danger'
    title?: string
    className?: string
}

export function Alert({ children, variant = 'info', title, className }: AlertProps) {
    const variants = {
        info: {
            container: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-500',
            title: 'text-blue-800',
            text: 'text-blue-700',
        },
        success: {
            container: 'bg-green-50 border-green-200',
            icon: 'text-green-500',
            title: 'text-green-800',
            text: 'text-green-700',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200',
            icon: 'text-yellow-500',
            title: 'text-yellow-800',
            text: 'text-yellow-700',
        },
        danger: {
            container: 'bg-red-50 border-red-200',
            icon: 'text-red-500',
            title: 'text-red-800',
            text: 'text-red-700',
        },
    }

    const icons = {
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        danger: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    }

    return (
        <div className={cn( 'flex gap-3 p-4 rounded-lg border', variants[variant].container, className )}>
            <div className={cn('flex-shrink-0', variants[variant].icon)}>
                {icons[variant]}
            </div>
            <div className="flex-1">
                {title && <h4 className={cn('font-medium mb-1', variants[variant].title)}>{title}</h4>}
                <div className={cn('text-sm', variants[variant].text)}>
                    {children}
                </div>
            </div>
        </div>
    )
}