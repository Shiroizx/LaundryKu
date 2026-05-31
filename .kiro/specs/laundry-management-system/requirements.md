# Requirements Document

## Introduction

Sistem Informasi Manajemen Laundry adalah aplikasi web fullstack berbasis Next.js yang mengelola operasional bisnis laundry. Sistem ini mendukung tiga role pengguna: Customer (pelanggan yang memesan layanan), Pegawai (staff yang memproses cucian), dan Owner/Admin (pemilik yang memonitor bisnis). Sistem mengintegrasikan booking laundry, pemilihan pegawai, reservasi mesin, tracking real-time, pembayaran, QR code scanning, dan dashboard monitoring.

## Glossary

- **System**: Sistem Informasi Manajemen Laundry
- **Customer**: Pengguna yang memesan layanan laundry
- **Pegawai**: Staff laundry yang memproses pesanan cucian
- **Owner**: Pemilik bisnis laundry yang memonitor operasional
- **Admin**: Administrator sistem dengan hak akses penuh
- **Order**: Pesanan laundry dari Customer
- **Booking**: Reservasi layanan laundry atau mesin
- **Mesin**: Mesin cuci atau pengering yang dapat direservasi
- **Status_Cucian**: Status tracking pesanan (misalnya: Diterima, Dicuci, Dikeringkan, Selesai)
- **QR_Code**: Kode QR yang digunakan untuk identifikasi dan tracking pesanan
- **Shift**: Jadwal kerja Pegawai
- **Transaksi**: Catatan pembayaran dan pesanan
- **RLS**: Row Level Security policy di database Supabase
- **Auth_Provider**: Supabase Authentication service
- **Database**: Supabase PostgreSQL database

## Requirements

### Requirement 1: User Authentication

**User Story:** Sebagai pengguna sistem, saya ingin dapat login dan register dengan role yang sesuai, sehingga saya dapat mengakses fitur yang relevan dengan peran saya.

#### Acceptance Criteria

1. THE System SHALL integrate dengan Auth_Provider untuk autentikasi pengguna
2. WHEN pengguna melakukan registrasi, THE System SHALL menyimpan data pengguna dengan role yang ditentukan (Customer, Pegawai, atau Owner)
3. WHEN pengguna melakukan login, THE System SHALL memverifikasi kredensial melalui Auth_Provider
4. WHEN autentikasi berhasil, THE System SHALL mengarahkan pengguna ke dashboard sesuai role mereka
5. THE System SHALL menyimpan session pengguna untuk akses berkelanjutan
6. WHEN pengguna logout, THE System SHALL menghapus session dan mengarahkan ke halaman login

### Requirement 2: Role-Based Access Control

**User Story:** Sebagai administrator sistem, saya ingin setiap role memiliki akses terbatas sesuai kewenangannya, sehingga data dan fitur terlindungi dari akses tidak sah.

#### Acceptance Criteria

1. THE Database SHALL menerapkan RLS policies untuk membatasi akses data berdasarkan role pengguna
2. WHEN Customer mengakses data, THE System SHALL hanya menampilkan data pesanan milik Customer tersebut
3. WHEN Pegawai mengakses data, THE System SHALL menampilkan pesanan yang ditugaskan kepada Pegawai tersebut dan pesanan yang tersedia
4. WHEN Owner mengakses data, THE System SHALL menampilkan seluruh data transaksi, pesanan, pegawai, dan mesin
5. IF pengguna mencoba mengakses resource yang tidak sesuai dengan role mereka, THEN THE System SHALL menolak akses dan mengembalikan error authorization

### Requirement 3: Customer Booking Laundry

**User Story:** Sebagai Customer, saya ingin dapat membuat pesanan laundry dengan mengisi form booking, sehingga cucian saya dapat diproses oleh laundry.

#### Acceptance Criteria

1. WHEN Customer mengakses halaman booking, THE System SHALL menampilkan form untuk memasukkan detail pesanan
2. THE System SHALL menerima input berupa jenis layanan, berat cucian, catatan khusus, dan preferensi waktu pengambilan
3. WHEN Customer mengirimkan form booking, THE System SHALL memvalidasi semua field yang wajib diisi
4. WHEN validasi berhasil, THE System SHALL menyimpan Order ke Database dengan status awal "Menunggu Konfirmasi"
5. WHEN Order berhasil dibuat, THE System SHALL menghasilkan QR_Code unik untuk Order tersebut
6. WHEN Order berhasil dibuat, THE System SHALL menampilkan konfirmasi dan detail pesanan kepada Customer

### Requirement 4: Customer Memilih Pegawai

**User Story:** Sebagai Customer, saya ingin dapat memilih Pegawai tertentu untuk menangani cucian saya, sehingga saya dapat menggunakan jasa Pegawai yang saya percaya.

#### Acceptance Criteria

1. WHEN Customer membuat booking, THE System SHALL menampilkan daftar Pegawai yang tersedia
2. THE System SHALL menampilkan informasi Pegawai seperti nama dan rating (jika ada)
3. WHERE Customer memilih Pegawai tertentu, THE System SHALL menetapkan Pegawai tersebut ke Order
4. WHERE Customer tidak memilih Pegawai, THE System SHALL menetapkan Order sebagai "Pegawai Bebas"
5. WHEN Order dengan Pegawai tertentu dibuat, THE System SHALL memberitahukan Pegawai tersebut tentang Order baru

### Requirement 5: Customer Booking Mesin

**User Story:** Sebagai Customer, saya ingin dapat memesan Mesin cuci atau pengering pada waktu tertentu, sehingga saya dapat menggunakan Mesin sesuai jadwal saya.

#### Acceptance Criteria

1. WHEN Customer mengakses halaman booking Mesin, THE System SHALL menampilkan daftar Mesin yang tersedia
2. THE System SHALL menampilkan status setiap Mesin (Tersedia, Digunakan, Rusak)
3. WHEN Customer memilih Mesin, THE System SHALL menampilkan slot waktu yang tersedia untuk Mesin tersebut
4. WHEN Customer memilih slot waktu, THE System SHALL memvalidasi bahwa slot tersebut belum dipesan
5. WHEN validasi berhasil, THE System SHALL membuat Booking Mesin dan menyimpannya ke Database
6. WHEN Booking Mesin berhasil, THE System SHALL mengubah status Mesin menjadi "Digunakan" untuk slot waktu yang dipilih
7. WHEN waktu Booking berakhir, THE System SHALL mengubah status Mesin kembali menjadi "Tersedia"

### Requirement 6: Customer Tracking Laundry

**User Story:** Sebagai Customer, saya ingin dapat melihat status cucian saya secara real-time, sehingga saya tahu kapan cucian saya akan selesai.

#### Acceptance Criteria

1. WHEN Customer mengakses halaman tracking, THE System SHALL menampilkan daftar Order aktif milik Customer
2. WHEN Customer memilih Order tertentu, THE System SHALL menampilkan Status_Cucian terkini
3. THE System SHALL menampilkan timeline status dengan timestamp setiap perubahan status
4. WHEN Status_Cucian diperbarui oleh Pegawai, THE System SHALL memperbarui tampilan tracking secara real-time
5. THE System SHALL menampilkan estimasi waktu selesai berdasarkan Status_Cucian saat ini

### Requirement 7: Customer Payment System

**User Story:** Sebagai Customer, saya ingin dapat melakukan pembayaran untuk pesanan laundry saya, sehingga transaksi dapat diselesaikan.

#### Acceptance Criteria

1. WHEN Order selesai diproses, THE System SHALL menghitung total biaya berdasarkan jenis layanan dan berat cucian
2. WHEN Customer mengakses halaman pembayaran, THE System SHALL menampilkan detail tagihan
3. THE System SHALL menyediakan metode pembayaran yang tersedia
4. WHEN Customer melakukan pembayaran, THE System SHALL memvalidasi dan memproses Transaksi
5. WHEN pembayaran berhasil, THE System SHALL menyimpan Transaksi ke Database dengan status "Lunas"
6. WHEN pembayaran berhasil, THE System SHALL mengubah status Order menjadi "Selesai dan Dibayar"
7. WHEN pembayaran berhasil, THE System SHALL menghasilkan bukti pembayaran untuk Customer

### Requirement 8: Customer Transaction History

**User Story:** Sebagai Customer, saya ingin dapat melihat riwayat transaksi saya sebelumnya, sehingga saya dapat melacak pesanan-pesanan yang pernah saya buat.

#### Acceptance Criteria

1. WHEN Customer mengakses halaman riwayat, THE System SHALL menampilkan daftar Transaksi milik Customer
2. THE System SHALL menampilkan informasi setiap Transaksi seperti tanggal, jenis layanan, total biaya, dan status
3. THE System SHALL mengurutkan Transaksi dari yang terbaru ke yang terlama
4. WHEN Customer memilih Transaksi tertentu, THE System SHALL menampilkan detail lengkap Transaksi tersebut
5. THE System SHALL menyediakan fitur filter berdasarkan tanggal atau status

### Requirement 9: Pegawai Menerima Order

**User Story:** Sebagai Pegawai, saya ingin dapat melihat dan mengambil pesanan yang masuk, sehingga saya dapat memproses cucian pelanggan.

#### Acceptance Criteria

1. WHEN Pegawai mengakses dashboard, THE System SHALL menampilkan daftar Order yang tersedia dan Order yang ditugaskan kepada Pegawai tersebut
2. THE System SHALL menampilkan detail setiap Order seperti nama Customer, jenis layanan, dan waktu pemesanan
3. WHEN Pegawai memilih Order yang tersedia, THE System SHALL menetapkan Order tersebut kepada Pegawai
4. WHEN Order ditetapkan, THE System SHALL mengubah status Order menjadi "Diterima"
5. THE System SHALL mencegah Pegawai lain mengambil Order yang sudah ditetapkan

### Requirement 10: Pegawai Update Status Cucian

**User Story:** Sebagai Pegawai, saya ingin dapat mengubah status cucian saat proses berlangsung, sehingga Customer dapat melacak progress cucian mereka.

#### Acceptance Criteria

1. WHEN Pegawai mengakses detail Order, THE System SHALL menampilkan Status_Cucian saat ini dan opsi status berikutnya
2. WHEN Pegawai mengubah status, THE System SHALL memvalidasi bahwa transisi status valid
3. WHEN validasi berhasil, THE System SHALL menyimpan Status_Cucian baru dengan timestamp ke Database
4. WHEN status diperbarui, THE System SHALL memperbarui tampilan tracking Customer secara real-time
5. THE System SHALL mencatat riwayat perubahan status untuk audit

### Requirement 11: Pegawai QR Code Scanning

**User Story:** Sebagai Pegawai, saya ingin dapat memindai QR_Code pada cucian untuk update status dengan cepat, sehingga proses tracking lebih efisien.

#### Acceptance Criteria

1. WHEN Pegawai mengakses fitur scan, THE System SHALL mengaktifkan kamera perangkat untuk memindai QR_Code
2. WHEN QR_Code berhasil dipindai, THE System SHALL mengidentifikasi Order yang terkait
3. WHEN Order teridentifikasi, THE System SHALL menampilkan detail Order dan opsi update status
4. WHEN Pegawai memilih status baru, THE System SHALL memperbarui Status_Cucian sesuai Requirement 10
5. IF QR_Code tidak valid atau tidak ditemukan, THEN THE System SHALL menampilkan pesan error yang jelas

### Requirement 12: Pegawai Jadwal Kerja

**User Story:** Sebagai Pegawai, saya ingin dapat melihat jadwal kerja dan Shift saya, sehingga saya tahu kapan saya harus bekerja.

#### Acceptance Criteria

1. WHEN Pegawai mengakses halaman jadwal, THE System SHALL menampilkan Shift yang ditugaskan kepada Pegawai tersebut
2. THE System SHALL menampilkan informasi Shift seperti tanggal, jam mulai, jam selesai, dan lokasi
3. THE System SHALL menampilkan jadwal dalam format kalender mingguan atau bulanan
4. THE System SHALL menampilkan notifikasi untuk Shift yang akan datang dalam 24 jam
5. WHEN Owner mengubah jadwal, THE System SHALL memperbarui tampilan jadwal Pegawai secara real-time

### Requirement 13: Pegawai Dashboard Order Masuk

**User Story:** Sebagai Pegawai, saya ingin dapat melihat antrean cucian hari ini di dashboard, sehingga saya dapat merencanakan pekerjaan saya.

#### Acceptance Criteria

1. WHEN Pegawai mengakses dashboard, THE System SHALL menampilkan jumlah Order yang masuk hari ini
2. THE System SHALL menampilkan Order yang sedang diproses oleh Pegawai tersebut
3. THE System SHALL menampilkan Order yang menunggu untuk diambil
4. THE System SHALL mengurutkan Order berdasarkan prioritas atau waktu pemesanan
5. THE System SHALL memperbarui dashboard secara real-time ketika Order baru masuk

### Requirement 14: Owner Monitoring Transaksi

**User Story:** Sebagai Owner, saya ingin dapat memonitor aliran kas dan pesanan, sehingga saya dapat memahami performa bisnis saya.

#### Acceptance Criteria

1. WHEN Owner mengakses dashboard monitoring, THE System SHALL menampilkan total pendapatan hari ini, minggu ini, dan bulan ini
2. THE System SHALL menampilkan jumlah Order yang selesai dan sedang diproses
3. THE System SHALL menampilkan daftar Transaksi terbaru dengan detail pembayaran
4. THE System SHALL menampilkan grafik tren pendapatan dalam periode waktu tertentu
5. THE System SHALL menyediakan filter berdasarkan tanggal, Pegawai, atau jenis layanan

### Requirement 15: Owner Monitoring Mesin

**User Story:** Sebagai Owner, saya ingin dapat melihat status semua Mesin, sehingga saya dapat memastikan operasional berjalan lancar dan mengidentifikasi Mesin yang perlu diperbaiki.

#### Acceptance Criteria

1. WHEN Owner mengakses halaman monitoring Mesin, THE System SHALL menampilkan daftar semua Mesin dengan status masing-masing
2. THE System SHALL menampilkan status Mesin (Tersedia, Digunakan, Rusak)
3. THE System SHALL menampilkan tingkat utilisasi setiap Mesin dalam periode waktu tertentu
4. WHEN Owner memilih Mesin tertentu, THE System SHALL menampilkan riwayat penggunaan dan maintenance Mesin tersebut
5. THE System SHALL menampilkan notifikasi untuk Mesin yang berstatus "Rusak"

### Requirement 16: Owner Kelola Pegawai

**User Story:** Sebagai Owner, saya ingin dapat mengelola data Pegawai dan jadwal kerja mereka, sehingga saya dapat mengatur operasional staff dengan efektif.

#### Acceptance Criteria

1. WHEN Owner mengakses halaman kelola Pegawai, THE System SHALL menampilkan daftar semua Pegawai
2. THE System SHALL menyediakan fitur untuk menambah Pegawai baru dengan data lengkap
3. WHEN Owner menambah Pegawai, THE System SHALL memvalidasi data dan menyimpannya ke Database
4. THE System SHALL menyediakan fitur untuk mengubah data Pegawai yang sudah ada
5. THE System SHALL menyediakan fitur untuk menonaktifkan atau menghapus Pegawai
6. THE System SHALL menyediakan fitur untuk mengatur Shift dan jadwal kerja Pegawai
7. WHEN Owner mengubah jadwal, THE System SHALL memvalidasi tidak ada konflik jadwal untuk Pegawai yang sama

### Requirement 17: Owner Laporan dan Statistik

**User Story:** Sebagai Owner, saya ingin dapat melihat laporan penghasilan dan statistik penggunaan Mesin, sehingga saya dapat membuat keputusan bisnis yang tepat.

#### Acceptance Criteria

1. WHEN Owner mengakses halaman laporan, THE System SHALL menampilkan rekap penghasilan dalam periode yang dipilih
2. THE System SHALL menampilkan grafik penghasilan harian, mingguan, dan bulanan
3. THE System SHALL menampilkan statistik penggunaan Mesin seperti jumlah booking dan tingkat utilisasi
4. THE System SHALL menampilkan performa Pegawai berdasarkan jumlah Order yang diselesaikan
5. THE System SHALL menyediakan fitur export laporan dalam format PDF atau CSV
6. THE System SHALL menampilkan perbandingan performa periode saat ini dengan periode sebelumnya

### Requirement 18: Database Schema dan RLS

**User Story:** Sebagai developer sistem, saya ingin memiliki skema Database yang terstruktur dengan RLS policies, sehingga data terlindungi dan akses terkontrol sesuai role.

#### Acceptance Criteria

1. THE Database SHALL memiliki tabel untuk users, orders, machines, bookings, transactions, shifts, dan status_history
2. THE Database SHALL menerapkan relasi foreign key yang tepat antar tabel
3. THE Database SHALL menerapkan RLS policies untuk setiap tabel berdasarkan role pengguna
4. WHEN Customer mengakses data, THE RLS SHALL membatasi akses hanya ke data milik Customer tersebut
5. WHEN Pegawai mengakses data, THE RLS SHALL membatasi akses ke Order yang ditugaskan dan data relevan lainnya
6. WHEN Owner mengakses data, THE RLS SHALL memberikan akses penuh ke semua data
7. THE Database SHALL menggunakan indexes untuk optimasi query pada kolom yang sering diakses

### Requirement 19: QR Code Generation

**User Story:** Sebagai sistem, saya ingin dapat menghasilkan QR_Code unik untuk setiap Order, sehingga Pegawai dapat melakukan tracking dengan mudah.

#### Acceptance Criteria

1. WHEN Order baru dibuat, THE System SHALL menghasilkan QR_Code unik yang berisi ID Order
2. THE System SHALL menyimpan QR_Code sebagai data yang dapat ditampilkan di halaman Customer
3. THE System SHALL memastikan setiap QR_Code unik dan tidak duplikat
4. WHEN Customer melihat detail Order, THE System SHALL menampilkan QR_Code yang dapat dicetak atau disimpan
5. THE QR_Code SHALL dapat dipindai oleh fitur scanning Pegawai sesuai Requirement 11

### Requirement 20: Next.js Project Structure

**User Story:** Sebagai developer, saya ingin memiliki struktur folder Next.js yang rapi dan modular, sehingga kode mudah dipelihara dan dikembangkan.

#### Acceptance Criteria

1. THE System SHALL menggunakan Next.js App Router dengan struktur folder yang memisahkan concerns
2. THE System SHALL memiliki folder terpisah untuk components (UI components), actions (server actions), lib (utilities), dan types (TypeScript types)
3. THE System SHALL mengorganisir routes berdasarkan role pengguna (customer, pegawai, owner)
4. THE System SHALL memiliki middleware untuk proteksi route berdasarkan role
5. THE System SHALL memiliki konfigurasi Supabase client untuk Server Components, Client Components, dan Middleware
6. THE System SHALL mengikuti best practices Next.js App Router dengan TypeScript

### Requirement 21: Supabase Integration

**User Story:** Sebagai developer, saya ingin memiliki setup Supabase yang proper di Next.js, sehingga aplikasi dapat berkomunikasi dengan Database dan Auth_Provider dengan aman.

#### Acceptance Criteria

1. THE System SHALL memiliki utility functions untuk membuat Supabase client di Server Components
2. THE System SHALL memiliki utility functions untuk membuat Supabase client di Client Components
3. THE System SHALL memiliki utility functions untuk membuat Supabase client di Middleware
4. THE System SHALL menyimpan Supabase credentials di environment variables
5. THE System SHALL menggunakan Supabase client yang sesuai dengan context (server/client/middleware)
6. THE System SHALL menangani error koneksi Database dengan graceful error handling

### Requirement 22: Real-time Updates

**User Story:** Sebagai pengguna sistem, saya ingin melihat perubahan data secara real-time tanpa perlu refresh halaman, sehingga informasi yang saya lihat selalu up-to-date.

#### Acceptance Criteria

1. WHEN Status_Cucian diperbarui, THE System SHALL memperbarui tampilan Customer secara real-time
2. WHEN Order baru masuk, THE System SHALL memperbarui dashboard Pegawai secara real-time
3. WHEN Transaksi baru terjadi, THE System SHALL memperbarui dashboard Owner secara real-time
4. THE System SHALL menggunakan Supabase Realtime subscriptions untuk perubahan data
5. WHEN koneksi real-time terputus, THE System SHALL mencoba reconnect secara otomatis

### Requirement 23: Responsive Design

**User Story:** Sebagai pengguna sistem, saya ingin aplikasi dapat diakses dengan baik di berbagai perangkat, sehingga saya dapat menggunakan sistem dari desktop maupun mobile.

#### Acceptance Criteria

1. THE System SHALL menggunakan Tailwind CSS untuk styling yang responsive
2. THE System SHALL menampilkan layout yang optimal untuk layar desktop (>1024px)
3. THE System SHALL menampilkan layout yang optimal untuk layar tablet (768px-1024px)
4. THE System SHALL menampilkan layout yang optimal untuk layar mobile (<768px)
5. WHEN Pegawai menggunakan fitur scan QR_Code di mobile, THE System SHALL mengoptimalkan tampilan kamera untuk layar kecil

### Requirement 24: Error Handling dan Validation

**User Story:** Sebagai pengguna sistem, saya ingin mendapatkan feedback yang jelas ketika terjadi error atau validasi gagal, sehingga saya tahu apa yang harus diperbaiki.

#### Acceptance Criteria

1. WHEN validasi form gagal, THE System SHALL menampilkan pesan error yang spesifik untuk setiap field
2. WHEN operasi Database gagal, THE System SHALL menampilkan pesan error yang user-friendly
3. WHEN autentikasi gagal, THE System SHALL menampilkan pesan error yang jelas tanpa mengekspos detail keamanan
4. THE System SHALL memvalidasi semua input di server-side sebelum menyimpan ke Database
5. THE System SHALL menangani network errors dengan retry mechanism atau fallback
6. THE System SHALL logging error ke console atau monitoring service untuk debugging
