# 🧺 LaundryKu - Web Application

LaundryKu adalah sistem manajemen operasional laundry modern berbasis web yang dibangun untuk mempermudah pengelolaan transaksi, manajemen mesin, pelacakan pesanan pelanggan, hingga pembuatan laporan keuangan. Aplikasi ini dirancang dengan pendekatan antarmuka "Data-Dense Dashboard" untuk efisiensi yang optimal.

## 🌟 Fitur Utama

Aplikasi ini memiliki 3 hak akses (Role) dengan fitur yang disesuaikan untuk masing-masing kebutuhan:

### 1. 👨‍💼 Owner (Pemilik)
- **Dashboard Analisis AI:** Dasbor komprehensif yang menampilkan metrik pendapatan, statistik pesanan, grafik tren, dan ringkasan intelijen operasional.
- **Laporan & Ekspor:** Kemampuan untuk mengekspor Laporan Keuangan dalam format **PDF** dan **Excel** (Mingguan, Bulanan, Tahunan).
- **Manajemen Karyawan:** Tambah, edit, dan pantau status serta jadwal kerja karyawan.
- **Manajemen Mesin:** Memantau utilisasi mesin dan mengetahui mesin mana yang paling sering digunakan (untuk jadwal *maintenance*).
- **Pemindai QR (QR Scanner):** Validasi resi digital dengan memindai kode QR.

### 2. 👷‍♂️ Employee (Karyawan)
- **Manajemen Antrean (Queue):** Mengelola pesanan yang baru masuk dan mengalokasikannya ke mesin yang tersedia.
- **Update Status:** Mengubah status pakaian (contoh: *Washing*, *Ironing*, *Finished*).
- **QR Scanner:** Memindai resi pelanggan saat penyerahan maupun pengambilan pakaian untuk otomatisasi proses.

### 3. 👤 Customer (Pelanggan)
- **Pelacakan (Tracking):** Memantau status cucian mereka secara *real-time* (mulai dari diterima hingga siap diambil).
- **Self-Service Booking:** Memesan slot mesin secara mandiri (*Self-Service Laundry*).
- **Riwayat Transaksi:** Melihat seluruh riwayat transaksi dan pembayaran.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan susunan teknologi (*Tech Stack*) modern:
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- **Komponen UI:** Shadcn UI / Radix UI
- **Visualisasi Data:** Recharts
- **Ekspor Dokumen:** `jspdf`, `jspdf-autotable`, `xlsx`
- **Pindai QR:** `react-qr-scanner` (atau library web scanner serupa)

## 🚀 Cara Menjalankan Aplikasi di Lokal (Development)

1. **Persiapan Environtment Variables:**
   Buat file `.env.local` di *root* direktori proyek, lalu isi dengan konfigurasi Supabase Anda:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Diperlukan untuk akses Admin API
   ```

2. **Instalasi Dependensi:**
   Buka terminal di direktori proyek dan jalankan perintah:
   ```bash
   npm install
   ```

3. **Menjalankan Server Mode Development:**
   ```bash
   npm run dev
   ```
   Server akan berjalan dan Anda bisa membuka aplikasi di [http://localhost:3000](http://localhost:3000).

## 📦 Skema Folder (Routing)
Aplikasi ini memanfaatkan App Router Next.js dengan pemisahan struktur folder seperti ini:
```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── customer/  # Halaman dasbor pelanggan
│   │   ├── employee/  # Halaman dasbor karyawan
│   │   └── owner/     # Halaman dasbor pemilik (admin)
│   ├── actions/       # Server Actions (Mutasi Data, Logika Ekspor PDF/Excel)
│   ├── login/         # Halaman autentikasi
│   └── register/      # Halaman registrasi
├── components/        # Komponen UI Reusable (Card, Button, Chart, Scanner)
├── lib/               # Utility dan konfigurasi (Supabase client)
└── ...
```

---
*Dokumentasi ini otomatis diperbarui seiring dengan berjalannya siklus rilis dan penambahan fitur.*
