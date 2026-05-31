-- Migration: Tambahkan Kebijakan RLS (Insert) untuk Tabel Payments
-- Mengizinkan Customer untuk membuat data pembayaran pada pesanannya sendiri

-- 1. Berikan hak akses tabel (Database Level)
GRANT INSERT, UPDATE ON payments TO authenticated;

-- 2. Kebijakan untuk INSERT
CREATE POLICY "payments_insert_own"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_id 
        AND bookings.user_id = auth.uid()
    )
);

-- 3. Kebijakan untuk UPDATE (Opsional)
CREATE POLICY "payments_update_own"
ON payments FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_id 
        AND bookings.user_id = auth.uid()
    )
);
