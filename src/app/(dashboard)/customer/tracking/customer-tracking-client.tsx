'use client'

import { useActionState } from 'react'
import { searchBooking } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CustomerTrackingClient() {
    const [state, formAction, isPending] = useActionState(searchBooking, { error: null as string | null })

    return (
        <div className="space-y-6 max-w-2xl mx-auto pt-10">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
                <p className="text-gray-500 mt-2">Cari tahu status cucian Anda dengan memasukkan kode pesanan.</p>
            </div>

            <Card className="shadow-lg border-0 bg-white ring-1 ring-gray-200">
                <CardContent className="p-6 sm:p-8">
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kode Pesanan
                            </label>
                            <Input 
                                name="code"
                                placeholder="Contoh: ORD-12345" 
                                className="h-14 text-lg text-center font-mono tracking-widest uppercase"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                {state.error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                            {isPending ? 'Mencari...' : 'Cari Pesanan'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
