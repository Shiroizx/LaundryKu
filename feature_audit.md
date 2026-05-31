# Audit Fitur LaundryKu — Halaman vs Kebutuhan (Update)

## Ringkasan

| Role | Fitur Dibutuhkan | Sudah Ada | Belum Ada | Status |
|------|-----------------|-----------|-----------|--------|
| **Customer** | 7 | 5 | 2 | 🟢 ~70% |
| **Pegawai** | 5 | 5 | 0 | 🟢 100% |
| **Owner** | 5 | 5 | 0 | 🟢 100% |

> [!TIP]
> Master Data (Owner), Booking (Customer), dan Manajemen Antrean (Pegawai) sudah terhubung penuh secara real-time ke Supabase dan berjalan normal!

---

## A. Customer

| # | Fitur | Status | Halaman | Catatan |
|---|-------|--------|---------|---------|
| 1 | Login / Register | ✅ Ada | `/login`, `/register` | Terhubung Supabase Auth. Berfungsi normal. |
| 2 | Booking Laundry | ✅ Ada | `/customer/orders/new` | Terhubung penuh dengan Supabase (`bookings` table). Termasuk form dinamis. |
| 3 | Pilih Pegawai | ✅ Ada | `/customer/orders/new` | Dropdown memilih pegawai sudah mengambil data *real-time* dari tabel pegawai. |
| 4 | Booking Mesin | ❌ Belum | — | Halaman booking mesin self-service belum ada. |
| 5 | Tracking Laundry | ✅ Ada | `/customer/track/[id]` | Halaman pelacakan penuh dengan progress bar real-time yang terhubung ke Supabase. |
| 6 | Pembayaran | ❌ Belum | — | Terintegrasi Midtrans belum diimplementasikan. |
| 7 | Lihat Riwayat | ✅ Ada | `/customer/orders` | Daftar pesanan lengkap dengan pencarian dan filter status. |

### Halaman Customer yang Ada:
- `/customer` → Dashboard utama (Real Data) ✅
- `/customer/orders/new` → Form Buat Pesanan Baru (Real Data) ✅
- `/customer/orders` → Riwayat Pesanan (Real Data) ✅
- `/customer/track/[id]` → Pelacakan Pesanan (Real-time & Real Data) ✅

---

## B. Pegawai Laundry

| # | Fitur | Status | Halaman | Catatan |
|---|-------|--------|---------|---------|
| 1 | Login / Register | ✅ Ada | `/register` | Opsi role "Pegawai Laundry" berfungsi normal. |
| 2 | Menerima Order | ✅ Ada | `/employee/queue` | Antrean masuk secara real-time dari booking customer. Tersedia *dedicated page*. |
| 3 | Update Status Cucian | ✅ Ada | `/employee/queue` | Pegawai bisa mengubah status secara urut (Pending -> Mencuci -> Selesai dll). |
| 4 | Melihat Order Masuk | ✅ Ada | `/employee/orders` | Halaman riwayat pesanan khusus yang ditugaskan ke pegawai tersebut (Real Data). |
| 5 | Melihat Jadwal Kerja | ✅ Ada | `/employee/schedule` | Halaman jadwal menarik shift dari Supabase (Real Data). |

### Halaman Employee yang Ada:
- `/employee` → Dashboard (Real Data & Real-time) ✅
- `/employee/queue` → Antrean Hari Ini (Real Data) ✅
- `/employee/orders` → Riwayat Pesanan (Real Data) ✅
- `/employee/schedule` → Jadwal Kerja Shift (Real Data) ✅

---

## C. Owner / Admin

| # | Fitur | Status | Halaman | Catatan |
|---|-------|--------|---------|---------|
| 1 | Monitoring Transaksi | ✅ Ada | `/owner` & `/owner/orders` | Dashboard dan Kelola Pesanan sudah 100% Real Data dan sinkron *real-time*. |
| 2 | Monitoring Mesin | ✅ Ada | `/owner/machines` | Manajemen master data mesin sudah CRUD ke database. |
| 3 | Kelola Pegawai | ✅ Ada | `/owner/employees` | Halaman kelola pegawai dan tambah pegawai (`/owner/employees/new`) terhubung ke Auth & Database Supabase. |
| 4 | Laporan Pendapatan | ❌ Belum | — | Belum ada halaman laporan. |
| 5 | Statistik Penggunaan | ✅ Ada | `/owner` (dashboard) | Menampilkan *stat cards* dari data real Supabase. |

### Halaman Owner yang Ada:
- `/owner` → Dashboard (Real Data) ✅
- `/owner/orders` → Kelola Pesanan (Real Data & Real-time) ✅
- `/owner/machines` → Kelola Mesin (Real Data CRUD) ✅
- `/owner/employees` → Kelola Pegawai (Real Data CRUD) ✅
- `/owner/employees/new` → Form Tambah Pegawai (Real Data) ✅
├── reports/
│   └── page.tsx          ← Laporan pendapatan
├── settings/
│   └── page.tsx          ← Pengaturan
```

---

## Prioritas Implementasi Selanjutnya

### 🔴 Prioritas Utama
1. **Form Booking Laundry (Customer)** → `/customer/orders/new` (✅ Selesai)
2. **Kelola Pegawai (Owner)** → `/owner/employees` (✅ Selesai)
3. **Riwayat & Pelacakan (Customer)** → `/customer/orders` & `/customer/track/[id]` (✅ Selesai)

### 🟡 Prioritas Menengah
4. **Pembayaran (Customer)** → `/customer/payments`
5. **Booking Mesin (Customer)** → `/customer/machines`

### 🟢 Prioritas Rendah
6. Laporan Pendapatan (Owner)
7. Halaman Profil (Customer)
