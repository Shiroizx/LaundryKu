# Quality Assurance (QA) Checklist Terpadu - LaundryKu

Gunakan dokumen ini untuk melakukan pengujian end-to-end (E2E) pada sistem LaundryKu, mencakup keseluruhan role: **Customer**, **Employee**, dan **Owner**.

---

## 1. Skenario Pengujian: CUSTOMER (Pelanggan)

### 1.1 Autentikasi & Profil
- [ ] Buka `/login` dan masuk menggunakan akun Customer.
- [ ] Jika belum punya, coba daftar akun baru di `/register` sebagai Pelanggan.
- [ ] Buka `/customer/profile`.
- [ ] Coba ubah Nama atau Nomor Telepon lalu klik **Simpan Perubahan**.
- [ ] Pastikan perubahan berhasil dan tersimpan setelah halaman di-refresh.

### 1.2 Form Booking Laundry (Layanan Reguler/Titip)
- [ ] Buka `/customer/orders/new`.
- [ ] Pastikan jenis layanan tersedia (misal: Cuci Lengkap, Cuci Kering) dan opsi "Cuci Mandiri" tidak ada.
- [ ] Masukkan Perkiraan Berat (kg) dan Catatan.
- [ ] Di bagian Pilih Pegawai, pilih salah satu pegawai tertentu atau pilih opsi "Pilih Acak".
- [ ] Pilih Tanggal & Waktu Pengambilan.
- [ ] Klik **Buat Pesanan**. Pastikan diarahkan ke dashboard dan pesanan muncul di bagian "Pesanan Saat Ini" dengan status *Pending*.

### 1.3 Booking Mesin (Self-Service)
- [ ] Buka `/customer/bookings`.
- [ ] Pastikan daftar mesin tampil beserta statusnya (Tersedia, Dipakai, Perawatan).
- [ ] Klik **Pesan Sekarang** pada mesin yang "Tersedia".
- [ ] Masukkan Perkiraan Berat (tidak boleh lebih dari kapasitas mesin).
- [ ] Pilih Tanggal dan Jam (perhatikan tidak ada lagi pilihan durasi, default 1 jam).
- [ ] Klik **Konfirmasi Booking**. Pastikan berhasil dan diarahkan ke halaman pembayaran, serta status mesin berubah menjadi "Dipakai" (jika jam saat ini).

### 1.4 Pembayaran
- [ ] Buka `/customer/payments`.
- [ ] Pilih tagihan yang belum dibayar, klik **Bayar Sekarang**.
- [ ] **Skenario A (Bayar di Tempat):** Pilih metode "Bayar di Tempat". Konfirmasi dan pastikan sistem memberikan "Kode Pembayaran" (misal: PAY-XXXX).
- [ ] **Skenario B (Transfer/QRIS):** Pilih metode "Transfer / QRIS". Unggah file gambar bukti bayar (ukuran < 2MB). Konfirmasi dan pastikan berhasil.

### 1.5 Lacak & Riwayat Pesanan
- [ ] Buka dashboard `/customer` atau `/customer/orders`.
- [ ] Klik **Lacak Pesanan** pada pesanan aktif.
- [ ] Pastikan halaman `/customer/track/[id]` menampilkan animasi progress bar sesuai status terkini dari pesanan (misal: "Pending" atau "Mencuci").
- [ ] Buka `/customer/orders` (Riwayat). Pastikan pesanan lama yang sudah selesai tampil dan bisa difilter/dicari.

---

## 2. Skenario Pengujian: EMPLOYEE (Pegawai)

### 2.1 Autentikasi & Dashboard
- [ ] Login menggunakan akun Pegawai.
- [ ] Buka dashboard utama `/employee`.
- [ ] Pastikan jadwal shift hari ini tampil dengan benar.

### 2.2 Manajemen Antrean (Update Status)
- [ ] Buka `/employee/queue`.
- [ ] Cari pesanan yang baru saja dibuat oleh Customer di Skenario 1.2.
- [ ] Klik **Proses: Mencuci**. Pastikan status berubah seketika.
- [ ] Buka tab browser lain sebagai Customer, cek halaman *Lacak Pesanan*. Pastikan progress bar bergerak maju ke tahap "Mencuci".
- [ ] Lanjutkan klik status dari *Mencuci -> Menyetrika -> Selesai*.
- [ ] Pastikan pesanan tersebut hilang dari "Antrean Hari Ini" setelah berstatus "Selesai", dan muncul di menu Riwayat (`/employee/orders`).

### 2.3 Scan QR / Pencarian Pesanan
- [ ] Buka `/employee/scan`.
- [ ] Berikan izin kamera di browser. Pastikan kamera menyala.
- [ ] Ketikkan Kode Pesanan (contoh: ORD-XXXX) secara manual ke kolom input (jika tidak ada QR fisik).
- [ ] Klik **Cari Data**. Pastikan sistem menemukan pesanan tersebut dan membuka rincian/mengalihkan ke riwayat yang relevan.

### 2.4 Verifikasi Pembayaran (Kasir)
- [ ] Buka halaman verifikasi/pembayaran dari sidebar Pegawai.
- [ ] Cari pembayaran yang dilakukan oleh Customer di Skenario 1.4.
- [ ] Untuk "Bayar di Tempat", cocokkan kode (PAY-XXXX) dan klik **Terima (Sah)** setelah uang diterima.
- [ ] Untuk "Transfer", klik gambar bukti bayar untuk melihat validitasnya, lalu klik **Terima (Sah)**.

---

## 3. Skenario Pengujian: OWNER (Admin/Pemilik)

### 3.1 Monitoring Dashboard & Laporan
- [ ] Login menggunakan akun Owner.
- [ ] Buka `/owner`. Pastikan metrik Total Pendapatan, Pesanan Aktif, dan Total Mesin muncul secara real-time.
- [ ] Buka `/owner/reports`. Pastikan laporan pendapatan tampil tanpa error.

### 3.2 Master Data: Kelola Pegawai
- [ ] Buka `/owner/employees`.
- [ ] Klik **Tambah Karyawan**. Pilih user, isi Kode, Posisi, dan Shift, lalu Simpan.
- [ ] Pastikan karyawan baru tersebut muncul di tabel.
- [ ] Coba edit Shift atau Posisi karyawan yang sudah ada.

### 3.3 Master Data: Kelola Mesin
- [ ] Buka `/owner/machines`.
- [ ] Tambahkan mesin cuci baru (Isi nomor, tipe, dan kapasitas).
- [ ] Klik edit/ubah status pada salah satu mesin yang "Tersedia" menjadi "Perawatan".
- [ ] Buka tab browser lain sebagai Customer (`/customer/bookings`), pastikan mesin tersebut statusnya menjadi warna kuning/orange "Perawatan" dan tidak bisa dipesan.

### 3.4 Kelola Transaksi (Keseluruhan)
- [ ] Buka `/owner/orders`.
- [ ] Cari pesanan apapun.
- [ ] Klik **Detail** dan coba lakukan pengubahan status pesanan secara manual (misal dari "Mencuci" langsung ke "Selesai" untuk bypass/override).
- [ ] Pastikan perubahan tersimpan dan disinkronisasi.

### 3.5 Pengaturan Metode Pembayaran
- [ ] Buka `/owner/settings` dan gulir ke bagian Metode Pembayaran.
- [ ] Tambahkan rekening Bank baru.
- [ ] Tambahkan QRIS baru (centang "Ini QRIS" dan unggah gambar).
- [ ] Hapus salah satu metode pembayaran lama.
- [ ] Login kembali sebagai Customer dan pastikan metode yang baru saja disetting muncul pada saat proses Pembayaran (Skenario 1.4).

---

**Selesai.** Jika seluruh kotak (checkbox) di atas dapat dicentang tanpa menemukan *error*, maka aplikasi LaundryKu versi ini sudah layak *deploy* ke tahap *Production*!
