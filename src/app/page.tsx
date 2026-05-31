import Link from 'next/link'
import { ScrollAnimator } from '@/components/landing/ScrollAnimator'
import { CountUpNumber } from '@/components/landing/CountUpNumber'
import { LandingNavbar } from '@/components/landing/LandingNavbar'

/* ─── Feature data ─── */
const features = [
  {
    title: 'Pesan Online',
    desc: 'Pesan layanan laundry kapan saja langsung dari HP Anda tanpa harus datang ke outlet.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    shadowColor: 'shadow-cyan-500/20',
  },
  {
    title: 'Lacak Pesanan',
    desc: 'Pantau status cucian Anda secara real-time — dari penerimaan hingga siap diambil.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    title: 'QR Code Tracking',
    desc: 'Scan QR code pada nota Anda untuk langsung melihat status dan detail pesanan.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M4 4h2m14 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 16h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    title: 'Antar-Jemput',
    desc: 'Layanan antar-jemput cucian langsung ke rumah Anda. Tinggal duduk santai.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    title: 'Hasil Bersih & Wangi',
    desc: 'Menggunakan deterjen premium dan mesin cuci modern untuk hasil terbaik.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-50 to-pink-50',
    shadowColor: 'shadow-rose-500/20',
  },
  {
    title: 'Bayar Mudah',
    desc: 'Pembayaran fleksibel via cash, e-wallet, bank transfer, atau QRIS.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    gradient: 'from-sky-500 to-indigo-500',
    bgGradient: 'from-sky-50 to-indigo-50',
    shadowColor: 'shadow-sky-500/20',
  },
]

/* ─── Steps data ─── */
const steps = [
  {
    num: '01',
    title: 'Daftar & Login',
    desc: 'Buat akun gratis dalam hitungan detik, lalu login ke akun Anda.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    num: '02',
    title: 'Pilih Layanan',
    desc: 'Pilih paket laundry sesuai kebutuhan Anda — cuci reguler, express, atau dry clean.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    num: '03',
    title: 'Kirim Cucian',
    desc: 'Antar ke outlet kami atau gunakan layanan jemput cucian dari rumah Anda.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    num: '04',
    title: 'Terima Bersih',
    desc: 'Cucian bersih dan wangi siap diambil atau kami antarkan ke rumah Anda.',
    gradient: 'from-green-500 to-lime-500',
  },
]

/* ─── Pricing data ─── */
const plans = [
  {
    name: 'Cuci Reguler',
    price: 'Rp 7K',
    period: '/kg',
    desc: 'Cuci harian untuk kebutuhan sehari-hari',
    features: ['Cuci + Setrika', 'Deterjen premium', 'Pewangi pilihan', 'Selesai 2-3 hari', 'Gratis antar min. 5kg'],
    cta: 'Pesan Sekarang',
    popular: false,
    gradient: 'from-slate-100 to-slate-50',
    border: 'border-slate-200',
  },
  {
    name: 'Cuci Express',
    price: 'Rp 12K',
    period: '/kg',
    desc: 'Butuh cepat? Selesai dalam hitungan jam',
    features: ['Cuci + Setrika', 'Deterjen premium', 'Pewangi pilihan', 'Selesai 6-12 jam', 'Gratis antar min. 3kg', 'Prioritas pengerjaan', 'Notifikasi real-time'],
    cta: 'Pesan Express',
    popular: true,
    gradient: 'from-cyan-500 to-teal-500',
    border: 'border-cyan-200',
  },
  {
    name: 'Dry Clean',
    price: 'Rp 25K',
    period: '/pcs',
    desc: 'Perawatan khusus untuk pakaian spesial',
    features: ['Dry cleaning profesional', 'Aman untuk bahan halus', 'Jas, gaun, & kebaya', 'Selesai 3-5 hari', 'Pengemasan khusus', 'Gratis inspeksi noda', 'Garansi kepuasan'],
    cta: 'Pesan Dry Clean',
    popular: false,
    gradient: 'from-slate-100 to-slate-50',
    border: 'border-slate-200',
  },
]

/* ─── Testimonials data ─── */
const testimonials = [
  {
    name: 'Rina Marlina',
    role: 'Pelanggan Setia',
    text: 'Cucian selalu bersih dan wangi! Saya suka banget bisa tracking status pesanan langsung dari HP. Sangat praktis.',
    avatar: 'RM',
    gradient: 'from-cyan-400 to-teal-400',
  },
  {
    name: 'Budi Santoso',
    role: 'Pelanggan Express',
    text: 'Layanan express benar-benar cepat, pagi kirim sore sudah selesai. Kualitasnya juga tetap terjaga. Recommended!',
    avatar: 'BS',
    gradient: 'from-emerald-400 to-green-400',
  },
  {
    name: 'Dewi Anggraeni',
    role: 'Pelanggan Dry Clean',
    text: 'Jas dan gaun saya selalu ditangani dengan sangat hati-hati. Hasilnya seperti baru lagi. Terima kasih LaundryKu!',
    avatar: 'DA',
    gradient: 'from-violet-400 to-purple-400',
  },
]

export default function Home() {
  return (
    <div className="landing-page min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <LandingNavbar />

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative pt-32 pb-24 px-5 sm:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-br from-cyan-100/60 via-teal-50/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-100/50 via-sky-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-100/30 to-transparent rounded-full blur-3xl" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #0891B2 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <ScrollAnimator variant="fade-down" duration={600}>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-full border border-cyan-200/60 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                <span className="text-sm font-semibold text-cyan-700 tracking-wide">
                  Layanan Laundry Profesional & Terpercaya
                </span>
              </div>
            </ScrollAnimator>

            {/* Headline */}
            <ScrollAnimator variant="fade-up" delay={150} duration={800}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mt-8 tracking-tight">
                Cucian Bersih
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                    Wangi & Tepat Waktu
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 3 100 2 150 5C200 8 250 4 298 7" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="50%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </ScrollAnimator>

            {/* Subheadline */}
            <ScrollAnimator variant="fade-up" delay={300} duration={800}>
              <p className="text-lg sm:text-xl text-slate-500 mt-8 max-w-2xl mx-auto leading-relaxed font-medium">
                LaundryKu hadir untuk memudahkan hidup Anda. Pesan laundry online,
                lacak pesanan real-time, dan terima cucian bersih wangi tanpa repot.
              </p>
            </ScrollAnimator>

            {/* CTA buttons */}
            <ScrollAnimator variant="fade-up" delay={450} duration={800}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link
                  href="/register"
                  className="group w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  Pesan Laundry Sekarang
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="#cara-kerja"
                  className="group w-full sm:w-auto h-14 px-8 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lihat Layanan Kami
                </Link>
              </div>
            </ScrollAnimator>

            {/* Stats */}
            <ScrollAnimator variant="fade-up" delay={600} duration={800}>
              <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-16 max-w-2xl mx-auto">
                {[
                  { value: 5000, suffix: '+', label: 'Pelanggan Puas' },
                  { value: 15, suffix: 'K+', label: 'Pesanan Selesai' },
                  { value: 98, suffix: '%', label: 'Tingkat Kepuasan' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                      <CountUpNumber target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm text-slate-400 mt-1.5 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ScrollAnimator>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES SECTION ══════════ */}
      <section id="fitur" className="relative py-24 px-5 sm:px-8">
        {/* Subtle background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50/80 to-white" />

        <div className="max-w-7xl mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-cyan-600 uppercase tracking-widest">Fitur Unggulan</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                Kenapa Pilih LaundryKu?
              </h2>
              <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">
                Layanan laundry lengkap yang mengutamakan kenyamanan Anda
              </p>
            </div>
          </ScrollAnimator>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollAnimator key={f.title} variant="fade-up" delay={i * 100}>
                <div className={`group relative p-8 rounded-3xl bg-gradient-to-br ${f.bgGradient} border border-white/80 hover:shadow-xl ${f.shadowColor} transition-all duration-500 hover:-translate-y-1 cursor-pointer`}>
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg ${f.shadowColor} group-hover:scale-105 transition-transform duration-300`}>
                    {f.icon}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>

                  {/* Arrow icon on hover */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS SECTION ══════════ */}
      <section id="cara-kerja" className="relative py-24 px-5 sm:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-teal-50/50 to-emerald-50/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-100/30 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-teal-600 uppercase tracking-widest">Cara Kerja</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                4 Langkah Mudah
              </h2>
              <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">
                Pesan laundry semudah pesan makanan online
              </p>
            </div>
          </ScrollAnimator>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <ScrollAnimator key={step.num} variant="fade-up" delay={i * 150}>
                <div className="relative text-center group">
                  {/* Number circle */}
                  <div className="relative mx-auto mb-6">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg shadow-cyan-500/15 group-hover:scale-105 group-hover:shadow-cyan-500/25 transition-all duration-300`}>
                      <span className="text-2xl font-extrabold text-white">{step.num}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>

                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+50px)] w-[calc(100%-60px)]">
                      <div className="h-[2px] bg-gradient-to-r from-cyan-300 to-teal-200 rounded-full" />
                    </div>
                  )}
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING SECTION ══════════ */}
      <section id="harga" className="relative py-24 px-5 sm:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-slate-50/50" />

        <div className="max-w-7xl mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-cyan-600 uppercase tracking-widest">Harga Layanan</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                Harga Terjangkau
              </h2>
              <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">
                Pilih layanan laundry sesuai kebutuhan Anda dengan harga bersahabat
              </p>
            </div>
          </ScrollAnimator>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <ScrollAnimator key={plan.name} variant="fade-up" delay={i * 150}>
                <div className={`relative rounded-3xl p-8 transition-all duration-500 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-2xl shadow-cyan-500/25 scale-[1.03] hover:scale-[1.05]'
                    : `bg-white border ${plan.border} hover:shadow-xl hover:-translate-y-1`
                } cursor-pointer`}>
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-white text-cyan-600 text-sm font-bold rounded-full shadow-lg">
                      Paling Diminati
                    </div>
                  )}

                  <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {plan.desc}
                  </p>

                  <div className="mt-6 mb-8">
                    <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ml-1 ${plan.popular ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-cyan-200' : 'text-cyan-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${plan.popular ? 'text-cyan-50' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`block w-full py-3.5 text-center font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                      plan.popular
                        ? 'bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS SECTION ══════════ */}
      <section id="testimoni" className="relative py-24 px-5 sm:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-cyan-50/40 to-sky-50/30" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-100/40 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-teal-600 uppercase tracking-widest">Testimoni</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
                Apa Kata Pelanggan Kami
              </h2>
              <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">
                Ribuan pelanggan puas dengan layanan LaundryKu
              </p>
            </div>
          </ScrollAnimator>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <ScrollAnimator key={t.name} variant="fade-up" delay={i * 150}>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                  {/* Quote icon */}
                  <svg className="w-10 h-10 text-cyan-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                  </svg>
                  <p className="text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section className="relative py-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimator variant="scale">
            <div className="relative rounded-[2rem] p-12 sm:p-16 overflow-hidden text-center">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500" />
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Cucian Menumpuk?
                  <br />
                  Serahkan ke LaundryKu!
                </h2>
                <p className="text-lg text-cyan-100 mt-6 max-w-xl mx-auto">
                  Bergabung dengan 5.000+ pelanggan puas yang sudah mempercayakan cucian mereka ke LaundryKu
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                  <Link
                    href="/register"
                    className="group w-full sm:w-auto h-14 px-8 bg-white text-cyan-600 font-bold rounded-2xl flex items-center justify-center gap-2.5 hover:bg-cyan-50 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
                  >
                    Pesan Laundry Sekarang
                    <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
                <p className="text-sm text-cyan-200 mt-5">
                  Gratis daftar · Pesan dari HP · Antar-jemput tersedia
                </p>
              </div>
            </div>
          </ScrollAnimator>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-16 px-5 sm:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-900">LaundryKu</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Layanan laundry profesional dengan teknologi modern untuk kenyamanan Anda.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Layanan</h4>
              <ul className="space-y-2.5">
                {['Cuci Reguler', 'Cuci Express', 'Dry Clean', 'Antar-Jemput'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Perusahaan</h4>
              <ul className="space-y-2.5">
                {['Tentang Kami', 'Lokasi Outlet', 'Karir', 'Hubungi Kami'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Support</h4>
              <ul className="space-y-2.5">
                {['FAQ', 'Cara Pesan', 'Lacak Pesanan', 'Kebijakan Privasi'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} LaundryKu. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {/* Social icons */}
              {[
                { label: 'Instagram', path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 3h11A3.5 3.5 0 0121 6.5v11a3.5 3.5 0 01-3.5 3.5h-11A3.5 3.5 0 013 17.5v-11A3.5 3.5 0 016.5 3z' },
                { label: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-cyan-50 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
