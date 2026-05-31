-- ============================================
-- MIGRATION: Employee Schedules (Jadwal Shift Mingguan)
-- ============================================
-- Menambahkan tabel employee_schedules untuk menyimpan pola shift
-- mingguan berulang per karyawan (recurring weekly schedule).
-- 
-- day_of_week: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu

-- 1. Buat tabel employee_schedules
CREATE TABLE IF NOT EXISTS employee_schedules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (employee_id, day_of_week)
);

-- 2. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_employee_schedules_employee_id ON employee_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_day_of_week ON employee_schedules(day_of_week);

-- 3. Auto-update updated_at
CREATE OR REPLACE TRIGGER update_employee_schedules_updated_at
    BEFORE UPDATE ON employee_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Owner bisa kelola semua jadwal
-- Gunakan profiles table (kolom role ada di profiles)
DROP POLICY IF EXISTS "employee_schedules_owner_all" ON employee_schedules;
CREATE POLICY "employee_schedules_owner_all"
    ON employee_schedules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'owner'::user_role
        )
    );

-- Employee bisa lihat jadwal milik sendiri
DROP POLICY IF EXISTS "employee_schedules_employee_own" ON employee_schedules;
CREATE POLICY "employee_schedules_employee_own"
    ON employee_schedules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id = employee_schedules.employee_id
            AND e.user_id = auth.uid()
        )
    );

-- Customer dan employee bisa SELECT semua jadwal aktif
-- (diperlukan agar customer bisa cek ketersediaan pegawai saat buat pesanan)
DROP POLICY IF EXISTS "employee_schedules_select_authenticated" ON employee_schedules;
CREATE POLICY "employee_schedules_select_authenticated"
    ON employee_schedules FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- 6. Grant permissions
GRANT SELECT ON employee_schedules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON employee_schedules TO authenticated;
