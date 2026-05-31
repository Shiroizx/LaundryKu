'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden relative auth-layout-wrapper">
      <style>{`
        /* Memaksa gaya input cerah terlepas dari mode gelap OS / media query */
        .auth-layout-wrapper input {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
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
          border-color: #cbd5e1 !important;
        }
      `}</style>
      
      {/* Decorative Orbs in Background */}
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/30 to-emerald-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* SVG Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Left Panel: Visual Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 relative overflow-hidden flex-col justify-between p-12 text-white shadow-2xl z-10">
        {/* Left Panel Backdrops */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />

        {/* Top: Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group z-20 cursor-pointer w-fit">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-all duration-300">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">LaundryKu</span>
        </Link>

        {/* Center: Branding Copy & Interactive cards */}
        <div className="my-auto space-y-10 z-20">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Sistem Manajemen <br />
              <span className="text-cyan-200">Laundry Modern</span>
            </h1>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-md">
              Kelola pesanan laundry Anda dengan mudah. Lacak status cucian secara real-time dari jemputan hingga siap antar.
            </p>
          </div>

          {/* Floating Glass Cards */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-400/20 rounded-xl flex items-center justify-center text-cyan-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Layanan Express & Premium</h3>
                  <p className="text-xs text-white/75 mt-0.5">Cucian bersih berkilau dan wangi dalam waktu singkat.</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center text-emerald-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">QR Code Tracking</h3>
                  <p className="text-xs text-white/75 mt-0.5">Scan kode unik di nota untuk memantau status cuci Anda.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="text-white/60 text-xs font-medium z-20 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} LaundryKu. All rights reserved.</span>
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">Kembali ke Beranda</Link>
        </div>
      </div>

      {/* Right Panel: Content Form */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 md:p-20 min-h-screen relative z-10">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex justify-between items-center lg:hidden mb-8 w-full">
          <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">LaundryKu</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer">
            Beranda
          </Link>
        </div>

        {/* Center: Form Children */}
        <div className="my-auto w-full max-w-md mx-auto flex flex-col justify-center">
          {children}
        </div>

        {/* Mobile Footer (Hidden on Desktop) */}
        <div className="text-center text-slate-400 text-xs mt-8 lg:hidden">
          &copy; {new Date().getFullYear()} LaundryKu. All rights reserved.
        </div>
      </div>
    </div>
  )
}
