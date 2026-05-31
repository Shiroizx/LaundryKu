'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState, useEffect, useState } from 'react'
import { useCustomerDashboard } from '@/hooks/use-customer-dashboard'
import type { Profile } from '@/lib/supabase/database-types'
import { updateProfile } from './actions'

interface CustomerProfileClientProps {
    initialProfile: Profile | null
}

export function CustomerProfileClient({ initialProfile }: CustomerProfileClientProps) {
    const { profile, refresh } = useCustomerDashboard({ initialProfile })
    const [state, formAction, isPending] = useActionState(updateProfile, null)
    const [saved, setSaved] = useState(false)

    // Sync form values on profile load
    const [form, setForm] = useState({
        full_name: initialProfile?.full_name || '',
        phone: initialProfile?.phone || ''
    })

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                phone: profile.phone || ''
            })
        }
    }, [profile])

    // Detect successful submission
    useEffect(() => {
        if (state?.success) {
            refresh()
            setSaved(true)
            const t = setTimeout(() => setSaved(false), 3000)
            return () => clearTimeout(t)
        }
    }, [state?.success, refresh])

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                <p className="text-gray-500 mt-1">Kelola informasi data diri akun Anda</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Akun</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <input type="hidden" name="profile_id" value={profile?.id || ''} />
                        
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
                                {profile?.full_name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                {state?.error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                                        {state.error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <Input 
                                        name="full_name"
                                        value={form.full_name} 
                                        onChange={(e) => setForm({...form, full_name: e.target.value})} 
                                        placeholder="Masukkan nama Anda" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <Input defaultValue={profile?.email || ''} type="email" disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        <p className="text-xs text-gray-400 mt-1">Email digunakan untuk login dan tidak dapat diubah</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nomor Telepon
                                        </label>
                                        <Input 
                                            name="phone"
                                            value={form.phone} 
                                            onChange={(e) => setForm({...form, phone: e.target.value})} 
                                            placeholder="08..." 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <Button type="submit" disabled={isPending || !profile}>
                                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            {saved && (
                                <span className="text-green-600 text-sm font-medium">Profil berhasil diperbarui!</span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
