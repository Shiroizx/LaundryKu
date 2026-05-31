-- ============================================
-- LAUNDRY MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. DROP EXISTING OBJECTS (Reset)
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS machine_bookings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions after tables (because triggers depend on them)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_booking_code() CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS machine_status CASCADE;
DROP TYPE IF EXISTS machine_type CASCADE;
DROP TYPE IF EXISTS service_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- ============================================
-- 2. CREATE ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'employee', 'owner');
CREATE TYPE booking_status AS ENUM ('pending', 'washing', 'ironing', 'finished', 'picked_up', 'cancelled');
CREATE TYPE machine_status AS ENUM ('available', 'in_use', 'maintenance');
CREATE TYPE machine_type AS ENUM ('washing_machine', 'dryer', 'iron');
CREATE TYPE service_type AS ENUM ('self_service', 'full_service', 'express');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'e_wallet');

-- ============================================
-- 3. CREATE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_number TEXT NOT NULL UNIQUE,
    machine_type machine_type NOT NULL,
    brand TEXT,
    capacity_kg DECIMAL(5, 2),
    status machine_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL UNIQUE,
    position TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('morning', 'afternoon', 'night')),
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    service_type service_type NOT NULL,
    status booking_status DEFAULT 'pending',
    weight_kg DECIMAL(5, 2),
    notes TEXT,
    pickup_time TIMESTAMPTZ,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machine Bookings table
CREATE TABLE machine_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_id, start_time)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    method payment_method DEFAULT 'cash',
    status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings table
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_employee_id ON bookings(employee_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_machine_bookings_machine_id ON machine_bookings(machine_id);
CREATE INDEX idx_machine_bookings_start_time ON machine_bookings(start_time);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- 5. CREATE FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_code = 'LY-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Profile trigger on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Booking code trigger
CREATE TRIGGER generate_booking_code_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_code();

-- ============================================
-- 7. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- MACHINES POLICIES
CREATE POLICY "machines_select_auth" ON machines FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "machines_all_owner" ON machines FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- EMPLOYEES POLICIES
CREATE POLICY "employees_select_auth" ON employees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "employees_all_owner" ON employees FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- BOOKINGS POLICIES
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_auth" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "bookings_select_employee" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'owner'))
);
CREATE POLICY "bookings_update_employee" ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'owner'))
);

-- MACHINE_BOOKINGS POLICIES
CREATE POLICY "machine_bookings_select_auth" ON machine_bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "machine_bookings_all_employee" ON machine_bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'owner'))
);

-- PAYMENTS POLICIES
CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "payments_all_owner" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- NOTIFICATION_SETTINGS POLICIES
CREATE POLICY "notification_settings_own" ON notification_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_admin;

-- Grant permissions for service role (bypass RLS)
GRANT ALL ON profiles TO service_role;
GRANT ALL ON machines TO service_role;
GRANT ALL ON employees TO service_role;
GRANT ALL ON bookings TO service_role;
GRANT ALL ON machine_bookings TO service_role;
GRANT ALL ON payments TO service_role;
GRANT ALL ON notification_settings TO service_role;

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT SELECT ON machines TO authenticated;
GRANT SELECT ON employees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON machine_bookings TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT ALL ON notification_settings TO authenticated;

-- ============================================
-- 10. VERIFY SETUP
-- ============================================

SELECT '✅ Schema created successfully!' as result;

-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check trigger exists
SELECT tgname, tgtype FROM pg_trigger WHERE tgname = 'on_auth_user_created';