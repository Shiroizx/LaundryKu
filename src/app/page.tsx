import Link from 'next/link'
import { ScrollAnimator } from '@/components/landing/ScrollAnimator'
import { CountUpNumber } from '@/components/landing/CountUpNumber'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import Image from 'next/image'

/* ─── Feature data ─── */
const features = [
  {
    title: 'Pesan Online',
    desc: 'Layanan laundry kapan saja langsung dari smartphone Anda tanpa harus datang ke outlet.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    span: 'md:col-span-2 lg:col-span-4',
    bg: 'bg-slate-50',
  },
  {
    title: 'Lacak Pesanan',
    desc: 'Pantau status cucian secara real-time dari penerimaan hingga siap diambil.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    span: 'md:col-span-2 lg:col-span-2',
    bg: 'bg-cyan-50/50',
  },
  {
    title: 'QR Code Tracking',
    desc: 'Scan QR code pada nota untuk melihat detail pesanan secara instan.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M4 4h2m14 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 16h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    span: 'md:col-span-1 lg:col-span-2',
    bg: 'bg-slate-50',
  },
  {
    title: 'Antar-Jemput',
    desc: 'Cucian diambil dan diantar langsung ke rumah Anda.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    span: 'md:col-span-1 lg:col-span-2',
    bg: 'bg-slate-100/50',
  },
  {
    title: 'Pembayaran Fleksibel',
    desc: 'Dukung QRIS, e-wallet, bank transfer, hingga cash.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    span: 'md:col-span-2 lg:col-span-2',
    bg: 'bg-slate-50',
  },
]

/* ─── Steps data ─── */
const steps = [
  {
    num: '01',
    title: 'Daftar & Login',
    desc: 'Buat akun dalam hitungan detik.',
  },
  {
    num: '02',
    title: 'Pilih Layanan',
    desc: 'Reguler, express, atau dry clean sesuai kebutuhan.',
  },
  {
    num: '03',
    title: 'Kirim Cucian',
    desc: 'Antar ke outlet atau gunakan layanan jemput kami.',
  },
  {
    num: '04',
    title: 'Selesai',
    desc: 'Terima pakaian bersih dan wangi di depan pintu Anda.',
  },
]

/* ─── Pricing data ─── */
const plans = [
  {
    name: 'Reguler',
    price: 'Rp 8K',
    period: '/kg',
    desc: 'Layanan harian standar',
    features: ['Cuci & Setrika', 'Deterjen premium', 'Selesai 2-3 hari', 'Gratis antar (min. 5kg)'],
    cta: 'Pesan Sekarang',
    popular: false,
  },
  {
    name: 'Express',
    price: 'Rp 15K',
    period: '/kg',
    desc: 'Butuh cepat hari ini juga',
    features: ['Prioritas mesin', 'Selesai 6-12 jam', 'Gratis antar (min. 3kg)', 'Notifikasi instan'],
    cta: 'Pesan Express',
    popular: true,
  },
  {
    name: 'Cuci Sendiri',
    price: 'Rp 5K',
    period: '/kg',
    desc: 'Cuci pakaian secara mandiri',
    features: ['Akses mesin cuci', 'Deterjen dasar', 'Selesai 1-2 jam', 'Kering sempurna'],
    cta: 'Pesan Mesin',
    popular: false,
  },
]

/* ─── Testimonials data ─── */
const testimonials = [
  {
    name: 'Rina Marlina',
    role: 'Pekerja Kantoran',
    text: 'Sangat praktis. Tinggal scan QR di nota dan saya tahu kapan harus ambil cucian.',
  },
  {
    name: 'Budi Santoso',
    role: 'Mahasiswa',
    text: 'Layanan express sangat membantu ketika butuh baju cepat untuk sidang. Bersih dan rapi.',
  },
  {
    name: 'Dewi Anggraeni',
    role: 'Ibu Rumah Tangga',
    text: 'Jas suami dan gaun selalu ditangani hati-hati. Hasilnya seperti baru keluar butik.',
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Freelancer',
    text: 'Antar jemputnya tepat waktu. Sangat menghemat waktu saya untuk urusan rumah.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] overflow-x-hidden selection:bg-cyan-100 selection:text-cyan-900">
      <LandingNavbar />

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 px-6 sm:px-8 max-w-[1400px] mx-auto min-h-[90dvh] flex flex-col justify-center">
        {/* Clean minimal background noise/grid */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <ScrollAnimator variant="fade-up" duration={600}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200/60 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Sistem Laundry Modern</span>
            </div>
          </ScrollAnimator>

          <ScrollAnimator variant="fade-up" delay={100} duration={800}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tighter leading-[1.05] max-w-3xl">
              Cucian Bersih. <br className="hidden sm:block" />
              <span className="text-cyan-600">Tanpa Repot.</span>
            </h1>
          </ScrollAnimator>

          <ScrollAnimator variant="fade-up" delay={200} duration={800}>
            <p className="text-lg sm:text-xl text-slate-500 mt-8 max-w-xl mx-auto leading-relaxed font-medium">
              Layanan laundry profesional dengan tracking real-time. Kami menjemput, membersihkan, dan mengantar kembali pakaian Anda.
            </p>
          </ScrollAnimator>

          <ScrollAnimator variant="fade-up" delay={300} duration={800}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full sm:w-auto">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 h-14 px-8 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-[0.98] w-full sm:w-auto"
              >
                Mulai Pesan Sekarang
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="#cara-kerja"
                className="group flex items-center justify-center gap-2 h-14 px-8 bg-white text-slate-900 font-semibold rounded-full border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:bg-slate-50 w-full sm:w-auto"
              >
                Cara Kerja
              </Link>
            </div>
          </ScrollAnimator>
          
          {/* Subtle Stats */}
          <ScrollAnimator variant="fade-up" delay={450} duration={800}>
            <div className="flex items-center gap-8 sm:gap-16 mt-20 pt-10 border-t border-slate-200/60">
              <div className="text-left">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  <CountUpNumber target={5000} suffix="+" />
                </p>
                <p className="text-sm text-slate-500 font-medium mt-1">Pelanggan Aktif</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-left">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  <CountUpNumber target={15} suffix="K+" />
                </p>
                <p className="text-sm text-slate-500 font-medium mt-1">Pesanan Selesai</p>
              </div>
            </div>
          </ScrollAnimator>
        </div>
      </section>

      {/* ══════════ FEATURES (BENTO GRID) ══════════ */}
      <section id="fitur" className="py-24 lg:py-32 px-6 sm:px-8 border-t border-slate-100 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="mb-16 max-w-xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Layanan lengkap. <br className="hidden sm:block" />
                Didesain untuk efisiensi.
              </h2>
            </div>
          </ScrollAnimator>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <ScrollAnimator key={f.title} variant="fade-up" delay={i * 50} className={f.span}>
                <div className={`h-full p-8 rounded-[2rem] border border-slate-100 ${f.bg} flex flex-col justify-between group transition-colors duration-300 hover:bg-slate-100`}>
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 mb-12 group-hover:scale-105 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="cara-kerja" className="py-24 lg:py-32 px-6 sm:px-8 bg-slate-900 text-white">
        <div className="max-w-[1200px] mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="mb-20">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Semudah menghitung.
              </h2>
            </div>
          </ScrollAnimator>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {steps.map((step, i) => (
              <ScrollAnimator key={step.num} variant="fade-up" delay={i * 100}>
                <div className="relative group">
                  <div className="text-7xl lg:text-8xl font-black text-white/5 tracking-tighter mb-6 group-hover:text-cyan-500/10 transition-colors duration-500">
                    {step.num}
                  </div>
                  <div className="absolute top-8 left-4">
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="harga" className="py-24 lg:py-32 px-6 sm:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Harga transparan.
              </h2>
              <p className="text-lg text-slate-500 mt-6">
                Tidak ada biaya tersembunyi. Pilih layanan yang paling sesuai dengan kebutuhan cucian Anda.
              </p>
            </div>
          </ScrollAnimator>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((plan, i) => (
              <ScrollAnimator key={plan.name} variant="fade-up" delay={i * 100} className="h-full">
                <div className={`relative h-full rounded-[2rem] p-8 flex flex-col ${
                  plan.popular 
                    ? 'bg-slate-900 text-white shadow-2xl md:-mt-8 md:mb-8' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2">
                      <span className="bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full">
                        Populer
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={`text-sm mt-2 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="mb-8 pb-8 border-b border-white/10">
                    <span className="text-5xl font-extrabold tracking-tighter">{plan.price}</span>
                    <span className={`text-sm font-medium ml-1 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-cyan-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`block w-full py-4 text-center font-bold rounded-xl transition-transform duration-300 hover:scale-[0.98] ${
                      plan.popular
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
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

      {/* ══════════ TESTIMONIALS (MASONRY-ISH) ══════════ */}
      <section id="testimoni" className="py-24 lg:py-32 px-6 sm:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto">
          <ScrollAnimator variant="fade-up">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Dipercaya pelanggan.
              </h2>
            </div>
          </ScrollAnimator>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <ScrollAnimator key={t.name} variant="fade-up" delay={i * 100}>
                <div className="p-8 rounded-[2rem] bg-white border border-slate-100 flex flex-col justify-between h-full hover:border-slate-200 transition-colors">
                  <p className="text-lg text-slate-700 leading-relaxed mb-8">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-500 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-32 px-6 sm:px-8 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollAnimator variant="fade-up">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Pakaian bersih <br /> menanti Anda.
            </h2>
            <p className="text-lg text-slate-400 mt-6 max-w-xl mx-auto">
              Bergabung hari ini dan rasakan kemudahan layanan laundry modern.
            </p>
            <div className="mt-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full transition-transform duration-300 hover:scale-[0.98]"
              >
                Buat Akun Gratis
              </Link>
            </div>
          </ScrollAnimator>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-12 px-6 sm:px-8 bg-white border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/assets/logotextlandscape.png"
                  alt="LaundryKu Logo"
                  width={140}
                  height={38}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                Manajemen laundry modern dengan tracking real-time. Memudahkan pelanggan dan mengoptimalkan operasional.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Layanan</h4>
              <ul className="space-y-3">
                {['Cuci Reguler', 'Cuci Express', 'Dry Clean', 'Antar-Jemput'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Perusahaan</h4>
              <ul className="space-y-3">
                {['Tentang', 'Lokasi', 'Karir', 'Kontak'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {['Ketentuan Layanan', 'Kebijakan Privasi', 'Pusat Bantuan'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} LaundryKu. All rights reserved.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
