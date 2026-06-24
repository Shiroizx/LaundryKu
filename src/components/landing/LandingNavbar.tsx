'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-2 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(8,145,178,0.08)] border-b border-cyan-100/60'
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <Image
              src="/assets/logotextlandscape.png"
              alt="LaundryKu Logo"
              width={160}
              height={44}
              className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '#fitur', label: 'Keunggulan' },
              { href: '#cara-kerja', label: 'Cara Pesan' },
              { href: '#harga', label: 'Layanan' },
              { href: '#testimoni', label: 'Testimoni' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-cyan-600 rounded-xl hover:bg-cyan-50/60 transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-cyan-600 transition-colors duration-200 cursor-pointer"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl hover:from-cyan-600 hover:to-teal-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 cursor-pointer"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-cyan-50 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
            mobileOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-1 border-t border-cyan-100/60">
            {[
              { href: '#fitur', label: 'Keunggulan' },
              { href: '#cara-kerja', label: 'Cara Pesan' },
              { href: '#harga', label: 'Layanan' },
              { href: '#testimoni', label: 'Testimoni' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-cyan-600 rounded-xl hover:bg-cyan-50/60 transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm font-semibold text-center text-slate-700 hover:text-cyan-600 rounded-xl border border-slate-200 hover:border-cyan-200 transition-all cursor-pointer"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl cursor-pointer"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
