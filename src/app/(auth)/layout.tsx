'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Force light mode on auth pages to avoid dark mode style leakage
    const root = document.documentElement
    const hasDark = root.classList.contains('dark')
    if (hasDark) {
      root.classList.remove('dark')
    }
    return () => {
      // Restore dark mode when navigating away
      if (hasDark) {
        root.classList.add('dark')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-12 overflow-hidden relative auth-layout-wrapper">
      <style>{`
        /* Memaksa gaya input cerah terlepas dari mode gelap OS / media query */
        .auth-layout-wrapper input {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }
        .auth-layout-wrapper input:-webkit-autofill,
        .auth-layout-wrapper input:-webkit-autofill:hover, 
        .auth-layout-wrapper input:-webkit-autofill:focus, 
        .auth-layout-wrapper input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
        .auth-layout-wrapper input::placeholder {
          color: #94a3b8 !important;
        }
        .auth-layout-wrapper label {
          color: #334155 !important;
        }
        .auth-layout-wrapper input[type="checkbox"] {
          background-color: #ffffff !important;
        }
      `}</style>

      {/* Left Panel: Visual Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950 relative overflow-hidden flex-col justify-between p-12 text-white z-10">
        
        {/* Subtle geometric pattern instead of loud gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* Top: Logo */}
        <Link href="/" className="inline-flex items-center group z-20 cursor-pointer w-fit">
          <Image
            src="/assets/logoandtext.png"
            alt="LaundryKu Logo"
            width={160}
            height={44}
            className="h-9 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Center: Branding Copy */}
        <div className="my-auto space-y-12 z-20 max-w-md">
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tighter">
              Sistem Manajemen <br />
              <span className="text-cyan-400">Laundry Modern</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Kelola pesanan laundry Anda dengan mudah. Lacak status cucian secara real-time dari jemputan hingga siap antar.
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex flex-shrink-0 items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white tracking-tight">Cepat & Terpercaya</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Layanan express yang dioptimalkan untuk jadwal sibuk Anda.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex flex-shrink-0 items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M4 4h2m14 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white tracking-tight">Lacak dengan Mudah</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Scan kode QR dan ketahui persis di mana pakaian Anda berada.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="text-slate-500 text-sm font-medium z-20 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} LaundryKu</span>
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">Kembali ke Beranda</Link>
        </div>
      </div>

      {/* Right Panel: Content Form */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24 min-h-screen relative z-10 bg-white">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex justify-between items-center lg:hidden mb-12 w-full">
          <Link href="/" className="inline-flex items-center group cursor-pointer">
            <Image
              src="/assets/logotextlandscape.png"
              alt="LaundryKu Logo"
              width={140}
              height={36}
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
            Beranda
          </Link>
        </div>

        {/* Center: Form Children */}
        <div className="my-auto w-full max-w-[440px] mx-auto flex flex-col justify-center">
          {children}
        </div>

        {/* Mobile Footer (Hidden on Desktop) */}
        <div className="text-center text-slate-400 text-xs mt-12 lg:hidden">
          &copy; {new Date().getFullYear()} LaundryKu. All rights reserved.
        </div>
      </div>
    </div>
  )
}
