'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/supabase/auth-actions'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
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
        setIsLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        const result = await login(formData)

        setIsLoading(false)

        if (result.success && result.user) {
            // Redirect based on role
            const redirectPath = result.user.role === 'owner'
                ? '/owner'
                : result.user.role === 'employee'
                    ? '/employee'
                    : '/customer'
            
            setIsExiting(true)
            setTimeout(() => {
                window.location.href = redirectPath
            }, 300)
        } else {
            setError(result.error || 'Login gagal')
        }
    }

    return (
        <div 
            className={`w-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-cyan-100/50 rounded-3xl p-8 sm:p-10 transition-all duration-500 ease-out ${
                isMounted && !isExiting 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
            }`}
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Selamat Datang</h1>
                <p className="text-slate-400 mt-2 font-medium text-sm">Masuk ke akun LaundryKu Anda</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-semibold text-rose-600">{error}</p>
                </div>
            )}

            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div 
                    className={`transition-all duration-700 delay-75 ${
                        isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                >
                    <Input
                        label="Email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-transparent focus:ring-2 transition-all bg-white"
                    />
                </div>

                {/* Password Input */}
                <div 
                    className={`relative transition-all duration-700 delay-150 ${
                        isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                >
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-transparent focus:ring-2 transition-all bg-white pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Remember & Forgot */}
                <div 
                    className={`flex items-center justify-between text-sm transition-all duration-700 delay-225 ${
                        isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                >
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            suppressHydrationWarning
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer transition-colors" 
                        />
                        <span className="text-slate-500 group-hover:text-slate-700 transition-colors font-medium">Ingat saya</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => handleNavigate('/forgot-password')}
                        className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
                    >
                        Lupa password?
                    </button>
                </div>

                {/* Submit Button */}
                <div 
                    className={`pt-2 transition-all duration-700 delay-300 ${
                        isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                >
                    <Button 
                        type="submit" 
                        isLoading={isLoading}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-600/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-none"
                    >
                        Masuk
                    </Button>
                </div>
            </form>

            {/* Register Link */}
            <div 
                className={`mt-8 text-center text-sm transition-all duration-700 delay-375 ${
                    isMounted && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                <p className="text-slate-400 font-medium">
                    Belum punya akun?{' '}
                    <button
                        type="button"
                        onClick={() => handleNavigate('/register')}
                        className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors cursor-pointer"
                    >
                        Daftar sekarang
                    </button>
                </p>
            </div>
        </div>
    )
}