'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { register } from '@/lib/supabase/auth-actions'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [needsConfirmation, setNeedsConfirmation] = useState(false)
    const [debug, setDebug] = useState<string | null>(null)

    // Animation states
    const [isMounted, setIsMounted] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleNavigate = (path: string) => {
        setIsExiting(true)
        setTimeout(() => {
            router.push(path)
        }, 300)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }
        if (!agreedToTerms) {
            setError('Anda harus menyetujui syarat dan ketentuan')
            return
        }
        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setIsLoading(true)

        const formDataObj = new FormData()
        formDataObj.append('fullName', formData.name)
        formDataObj.append('email', formData.email)
        formDataObj.append('phone', formData.phone)
        formDataObj.append('password', formData.password)
        formDataObj.append('role', formData.role)

        const result = await register(formDataObj)

        setIsLoading(false)

        if (result.success) {
            setSuccess(true)
            setError(null)
            setDebug(result.debug || null)
            if (result.user?.id) {
                // User created and logged in immediately
                setNeedsConfirmation(false)
                setIsExiting(true)
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                // User created but needs email confirmation
                setNeedsConfirmation(true)
            }
        } else {
            setError(result.error || 'Registrasi gagal')
            setDebug(result.debug || null)
        }
    }

    return (
        <div 
            className={`w-full transition-all duration-500 ease-out ${
                isMounted && !isExiting 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
            }`}
        >
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Buat Akun</h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">Bergabung dengan LaundryKu dalam hitungan detik.</p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm font-medium text-emerald-700">
                        {needsConfirmation ? (
                            <p>
                                <strong>Registrasi berhasil!</strong><br />
                                Silakan cek email Anda untuk konfirmasi akun, kemudian silakan login.
                            </p>
                        ) : (
                            <p>Registrasi berhasil! Mengalihkan ke halaman login...</p>
                        )}
                    </div>
                </div>
            )}

            {/* Debug Info */}
            {debug && (
                <div className="mb-8 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-fade-in">
                    <p className="text-xs text-amber-700 font-mono whitespace-pre-wrap">
                        {debug}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className={`transition-all duration-700 delay-50 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <Input
                        label="Nama Lengkap"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                    />
                </div>

                {/* Email & Phone grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Email */}
                    <div className={`transition-all duration-700 delay-75 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-12 px-4 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                        />
                    </div>

                    {/* Phone */}
                    <div className={`transition-all duration-700 delay-100 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Input
                            label="Nomor Telepon"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="h-12 px-4 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Password fields grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Password */}
                    <div className={`relative transition-all duration-700 delay-150 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 6 karakter"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="h-12 px-4 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-[34px] w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className={`transition-all duration-700 delay-200 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Input
                            label="Konfirmasi Password"
                            type="password"
                            placeholder="Ulangi password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            className="h-12 px-4 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Agreement */}
                <div className={`flex items-start gap-3 transition-all duration-700 delay-250 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer transition-colors"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-500 font-medium leading-relaxed">
                        Saya menyetujui{' '}
                        <Link href="/terms" className="text-slate-900 hover:underline decoration-slate-300 underline-offset-4 transition-all">
                            Syarat dan Ketentuan
                        </Link>
                        {' '}serta{' '}
                        <Link href="/privacy" className="text-slate-900 hover:underline decoration-slate-300 underline-offset-4 transition-all">
                            Kebijakan Privasi
                        </Link>
                    </label>
                </div>

                {/* Submit button */}
                <div className={`pt-4 transition-all duration-700 delay-300 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={!agreedToTerms || success}
                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-none transition-all duration-300 hover:scale-[0.98] cursor-pointer"
                    >
                        Daftar Sekarang
                    </Button>
                </div>
            </form>

            {/* Login Link */}
            <div className={`mt-10 text-center text-sm transition-all duration-700 delay-350 ${isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-slate-500 font-medium">
                    Sudah punya akun?{' '}
                    <button
                        type="button"
                        onClick={() => handleNavigate('/login')}
                        className="text-slate-900 font-semibold hover:underline decoration-slate-300 underline-offset-4 transition-all cursor-pointer"
                    >
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    )
}