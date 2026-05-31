import { cn } from '@/lib/utils'

interface TableProps {
    children: React.ReactNode
    className?: string
}

export function Table({ children, className }: TableProps) {
    return (
        <div className={cn('w-full overflow-auto', className)}>
            <table className="w-full caption-bottom text-sm">
                {children}
            </table>
        </div>
    )
}

export function TableHeader({ children, className }: TableProps) {
    return (
        <thead className={cn('border-b border-gray-200 bg-gray-50', className)}>
            {children}
        </thead>
    )
}

export function TableBody({ children, className }: TableProps) {
    return (
        <tbody className={cn('[&_tr:last-child]:border-0', className)}>
            {children}
        </tbody>
    )
}

export function TableRow({ children, className }: TableProps) {
    return (
        <tr className={cn('border-b border-gray-200 transition-colors hover:bg-gray-50', className)}>
            {children}
        </tr>
    )
}

export function TableHead({ children, className }: TableProps) {
    return (
        <th className={cn('h-12 px-4 text-left align-middle font-medium text-gray-600', className)}>
            {children}
        </th>
    )
}

export function TableCell({ children, className }: TableProps) {
    return (
        <td className={cn('p-4 align-middle text-gray-900', className)}>
            {children}
        </td>
    )
}