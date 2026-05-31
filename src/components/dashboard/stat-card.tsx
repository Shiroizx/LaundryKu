import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
    className?: string
}

const variantConfig = {
    default: {
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        borderHover: 'group-hover:border-slate-300'
    },
    blue: {
        iconBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
        iconColor: 'text-blue-600',
        borderHover: 'group-hover:border-blue-300'
    },
    cyan: {
        iconBg: 'bg-gradient-to-br from-cyan-100 to-teal-50',
        iconColor: 'text-cyan-600',
        borderHover: 'group-hover:border-cyan-300'
    },
    green: {
        iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
        iconColor: 'text-emerald-600',
        borderHover: 'group-hover:border-emerald-300'
    },
    yellow: {
        iconBg: 'bg-gradient-to-br from-amber-100 to-amber-50',
        iconColor: 'text-amber-600',
        borderHover: 'group-hover:border-amber-300'
    },
    red: {
        iconBg: 'bg-gradient-to-br from-rose-100 to-rose-50',
        iconColor: 'text-rose-600',
        borderHover: 'group-hover:border-rose-300'
    },
    purple: {
        iconBg: 'bg-gradient-to-br from-indigo-100 to-indigo-50',
        iconColor: 'text-indigo-600',
        borderHover: 'group-hover:border-indigo-300'
    },
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default', className }: StatCardProps) {
    const config = variantConfig[variant]

    return (
        <Card className={cn('group overflow-hidden bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1', config.borderHover, className)}>
            <CardContent className="p-6 relative">
                {/* Subtle gradient glow effect on hover */}
                <div className={cn("absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl rounded-full", config.iconBg)} />
                
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{title}</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mt-2">{value}</p>
                        {subtitle && (
                            <p className="text-sm font-medium text-slate-400 mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <div className={cn( 'flex items-center gap-1.5 mt-3 text-sm font-bold px-2 py-1 rounded-md w-fit', trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600' )}>
                                <svg
                                    className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span>{trend.value}%</span>
                                <span className="text-slate-400 font-medium ml-1">vs kemarin</span>
                            </div>
                        )}
                    </div>
                    <div className={cn('p-3.5 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110', config.iconBg)}>
                        <div className={config.iconColor}>
                            {icon}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface QuickActionProps {
    title: string
    icon: React.ReactNode
    href?: string
    onClick?: () => void
    variant?: 'default' | 'cyan' | 'blue' | 'green' | 'purple'
    className?: string
}

const actionVariants = {
    default: 'hover:border-slate-300 hover:shadow-md bg-white',
    cyan: 'hover:border-cyan-300 hover:shadow-cyan-100 bg-white',
    blue: 'hover:border-blue-300 hover:shadow-blue-100 bg-white',
    green: 'hover:border-emerald-300 hover:shadow-emerald-100 bg-white',
    purple: 'hover:border-indigo-300 hover:shadow-indigo-100 bg-white',
}

export function QuickAction({ title, icon, href, onClick, variant = 'default', className }: QuickActionProps) {
    const content = (
        <div className={cn( 'group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-200 transition-all duration-300 text-center hover:-translate-y-1', actionVariants[variant], className )}>
            <div className={cn( 'p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm', variant === 'cyan' && 'bg-cyan-50 text-cyan-600', variant === 'blue' && 'bg-blue-50 text-blue-600', variant === 'green' && 'bg-emerald-50 text-emerald-600', variant === 'purple' && 'bg-indigo-50 text-indigo-600', variant === 'default' && 'bg-slate-50 text-slate-600' )}>
                {icon}
            </div>
            <span className="text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900">{title}</span>
        </div>
    )

    if (href) {
        return <a href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl">{content}</a>
    }

    return (
        <button onClick={onClick} className="w-full text-left block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl">
            {content}
        </button>
    )
}