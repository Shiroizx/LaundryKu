import { cn } from '@/lib/utils'

interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
    onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn( 'rounded-xl border border-gray-200 bg-white', hover && 'transition-shadow hover:shadow-md cursor-pointer', className )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: React.ReactNode
    className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
            {children}
        </h3>
    )
}

interface CardDescriptionProps {
    children: React.ReactNode
    className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-gray-500 mt-1', className)}>
            {children}
        </p>
    )
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={cn('px-6 py-4', className)}>
            {children}
        </div>
    )
}

interface CardFooterProps {
    children: React.ReactNode
    className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('px-6 py-4 border-t border-gray-200', className)}>
            {children}
        </div>
    )
}