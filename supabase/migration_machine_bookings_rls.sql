-- Migration: Tambahkan Kebijakan RLS untuk Booking Mesin (Customer & Employee)
-- Mengizinkan Customer untuk membuat data booking mesin miliknya sendiri
-- Mengizinkan Authenticated Users (Customer & Karyawan) untuk mengupdate status mesin

-- 1. Hak Akses Table (Database Level)
GRANT INSERT, SELECT, UPDATE ON machine_bookings TO authenticated;
GRANT UPDATE, SELECT ON machines TO authenticated;

-- 2. Kebijakan RLS untuk INSERT di machine_bookings
DROP POLICY IF EXISTS "machine_bookings_insert_own" ON machine_bookings;
CREATE POLICY "machine_bookings_insert_own"
ON machine_bookings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_id 
        AND bookings.user_id = auth.uid()
    )
);

-- 3. Kebijakan RLS untuk UPDATE di machines
DROP POLICY IF EXISTS "machines_update_authenticated" ON machines;
CREATE POLICY "machines_update_authenticated"
ON machines FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
