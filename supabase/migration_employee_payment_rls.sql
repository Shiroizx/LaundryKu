-- Migration: Tambahkan Kebijakan RLS untuk Karyawan (Employee) di Tabel Payments
-- Mengizinkan Karyawan untuk membaca dan memperbarui data pembayaran (verifikasi)

-- Kebijakan untuk SELECT (Membaca daftar pembayaran)
CREATE POLICY "payments_select_employee"
ON payments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'employee'
    )
);

-- Kebijakan untuk UPDATE (Menerima/Menolak pembayaran)
CREATE POLICY "payments_update_employee"
ON payments FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'employee'
    )
);
