# Quality Assurance (QA) Checklist End-to-End - LaundryKu

Gunakan dokumen ini untuk melakukan pengujian menyeluruh dari awal (E2E) pada sistem LaundryKu, mencakup keseluruhan role: **Customer**, **Employee**, dan **Owner**.

---

## 1. Skenario Pengujian: CUSTOMER (Pelanggan)

### 1.1 Autentikasi & Profil
- [x] Buka `/login` dan masuk menggunakan akun Customer.
- [x] Jika belum punya, coba daftar akun baru di `/register` sebagai Pelanggan.
- [x] Buka `/customer/profile`.
- [x] Coba ubah Nama atau Nomor Telepon lalu klik **Simpan Perubahan**.
- [x] Pastikan perubahan berhasil dan tersimpan setelah halaman di-refresh.

### 1.2 Form Booking Laundry (Layanan Reguler/Titip)
- [x] Buka `/customer/orders/new`.
- [x] Pastikan jenis layanan tersedia (misal: Cuci Lengkap, Cuci Kering) dan opsi "Cuci Mandiri" tidak ada.
- [x] Masukkan Perkiraan Berat (kg) dan Catatan.
- [x] Di bagian Pilih Pegawai, pilih salah satu pegawai tertentu atau pilih opsi "Pilih Acak".
- [x] Pilih Tanggal & Waktu Pengambilan.
- [x] Klik **Buat Pesanan**. Pastikan diarahkan ke dashboard dan pesanan muncul di bagian "Pesanan Saat Ini" dengan status *Pending*.

### 1.3 Booking Mesin (Self-Service)
- [x] Buka `/customer/bookings`.
- [x] Pastikan daftar mesin tampil beserta statusnya (Tersedia, Dipakai, Perawatan).
- [x] Klik **Pesan Sekarang** pada mesin yang "Tersedia".
- [x] Masukkan Perkiraan Berat (tidak boleh lebih dari kapasitas mesin).
- [x] Pilih Tanggal dan Jam (perhatikan tidak ada lagi pilihan durasi, default 1 jam).
- [x] Klik **Konfirmasi Booking**. Pastikan berhasil dan diarahkan ke halaman pembayaran, serta status mesin berubah menjadi "Dipakai" (jika jam saat ini).

### 1.4 Pembayaran
- [x] Buka `/customer/payments`.
- [x] Pilih tagihan yang belum dibayar, klik **Bayar Sekarang**.
- [x] **Skenario A (Bayar di Tempat):** Pilih metode "Bayar di Tempat". Konfirmasi dan pastikan sistem memberikan "Kode Pembayaran" (misal: PAY-XXXX).
- [x] **Skenario B (Transfer/QRIS):** Pilih metode "Transfer / QRIS". Unggah file gambar bukti bayar (ukuran < 2MB). Konfirmasi dan pastikan berhasil.

### 1.5 Lacak & Riwayat Pesanan
- [x] Buka dashboard `/customer` atau `/customer/orders`.
- [x] Klik **Lacak Pesanan** pada pesanan aktif.
- [x] Pastikan halaman `/customer/track/[id]` menampilkan animasi progress bar sesuai status terkini dari pesanan (misal: "Pending" atau "Mencuci").
- [x] Buka `/customer/orders` (Riwayat). Pastikan pesanan lama yang sudah selesai tampil dan bisa difilter/dicari.

---

## 2. Skenario Pengujian: EMPLOYEE (Pegawai)

### 2.1 Autentikasi & Dashboard
- [x] Login menggunakan akun Pegawai.
- [x] Buka dashboard utama `/employee`.
- [x] Pastikan jadwal shift hari ini tampil dengan benar.

### 2.2 Verifikasi Pembayaran (Kasir)
*Lakukan verifikasi pembayaran terlebih dahulu agar pesanan bisa mulai diproses.*
- [x] Buka halaman verifikasi pembayaran (jika ada di sidebar Pegawai) atau dari daftar pesanan yang harus diverifikasi.
- [x] Cari pembayaran yang dilakukan oleh Customer di Skenario 1.4.
- [x] Untuk "Bayar di Tempat", cocokkan kode (PAY-XXXX) dan klik **Terima (Sah)** setelah uang diterima.
- [x] Untuk "Transfer", klik gambar bukti bayar untuk melihat validitasnya, lalu klik **Terima (Sah)**.

### 2.3 Manajemen Antrean & Update Status
- [x] Buka `/employee/queue`.
- [x] Cari pesanan yang baru saja dibuat oleh Customer pada **Skenario 1.2** (Layanan Reguler/Titip).
- [x] Pastikan pesanan mesin mandiri (dari Skenario 1.3) **TIDAK** muncul di antrean ini.
- [x] Jika pesanan belum diverifikasi pembayarannya, pastikan tombol "Proses: Mencuci" **tidak bisa diklik** (disabled) dan muncul peringatan merah "Belum Lunas".
- [x] Jika sudah diverifikasi pembayarannya (dari langkah 2.2), klik **Proses: Mencuci**. Pastikan status berubah seketika.
- [x] Buka tab browser lain sebagai Customer, cek halaman *Lacak Pesanan*. Pastikan progress bar bergerak maju ke tahap "Mencuci".
- [x] Lanjutkan klik status dari *Mencuci -> Menyetrika -> Selesai*.
- [x] Pastikan pesanan tersebut hilang dari "Antrean Hari Ini" setelah berstatus "Selesai", dan muncul di menu Riwayat (`/employee/orders`).

### 2.4 Scan QR / Pencarian Pesanan
- [x] Buka `/employee/scan`.
- [x] Berikan izin kamera di browser. Pastikan kamera menyala.
- [x] Ketikkan Kode Pesanan (contoh: ORD-XXXX) secara manual ke kolom input (jika tidak ada QR fisik).
- [x] Klik **Cari Data**. Pastikan sistem menemukan pesanan tersebut dan membuka rincian/mengalihkan ke riwayat yang relevan.

---

## 3. Skenario Pengujian: OWNER (Admin/Pemilik)

### 3.1 Monitoring Dashboard & Laporan
- [x] Login menggunakan akun Owner.
- [x] Buka `/owner`. Pastikan metrik Total Pendapatan, Pesanan Aktif, dan Total Mesin muncul secara real-time.
- [x] Buka `/owner/reports`. Pastikan laporan pendapatan tampil tanpa error.

### 3.2 Master Data: Kelola Pegawai
- [x] Buka `/owner/employees`.
- [x] Klik **Tambah Karyawan**. Isi form (Nama, Email, Password, Kode, Posisi), lalu Simpan.
- [x] Pastikan karyawan baru tersebut muncul di tabel.
- [x] Coba edit Posisi karyawan yang sudah ada.

### 3.3 Master Data: Kelola Mesin
- [x] Buka `/owner/machines`.
- [x] Tambahkan mesin cuci baru (Isi Nomor, Tipe, Kapasitas, dan Harga Per Kg).
- [x] Klik edit pada salah satu mesin dan ubah Harga Per Kg nya (contoh: 7000).
- [x] Buka tab browser lain sebagai Customer (`/customer/bookings`), pastikan tarif baru tersebut tampil di kartu mesin dan total estimasi harganya terkalkulasi dengan benar.
- [x] Klik edit/ubah status pada salah satu mesin yang "Tersedia" menjadi "Perawatan", lalu pastikan statusnya langsung berubah menjadi kuning/orange dan tidak bisa dipesan di sisi Customer.

### 3.4 Kelola Transaksi (Keseluruhan)
- [x] Buka `/owner/orders`.
- [x] Cari pesanan apapun.
- [x] Klik **Detail** dan coba lakukan pengubahan status pesanan secara manual (misal dari "Mencuci" langsung ke "Selesai" untuk bypass/override).
- [x] Pastikan perubahan tersimpan dan disinkronisasi.

### 3.5 Pengaturan Metode Pembayaran
- [x] Buka `/owner/settings` dan gulir ke bagian Metode Pembayaran.
- [x] Tambahkan rekening Bank baru.
- [x] Tambahkan QRIS baru (centang "Ini QRIS" dan unggah gambar).
- [x] Hapus salah satu metode pembayaran lama.
- [x] Login kembali sebagai Customer dan pastikan metode yang baru saja disetting muncul pada saat proses Pembayaran (Skenario 1.4).
