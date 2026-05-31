-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'employee', 'owner');
CREATE TYPE booking_status AS ENUM ('pending', 'washing', 'ironing', 'finished', 'picked_up', 'cancelled');
CREATE TYPE machine_status AS ENUM ('available', 'in_use', 'maintenance');
CREATE TYPE machine_type AS ENUM ('washing_machine', 'dryer', 'iron');
CREATE TYPE service_type AS ENUM ('self_service', 'full_service', 'express');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'e_wallet');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
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

-- User Roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Employees (extends profiles with employee-specific data)
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

-- Machines
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

-- Bookings
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

-- Machine Bookings (jadwal mesin)
CREATE TABLE machine_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_id, start_time)
);

-- Payments
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

-- Notification Settings
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
-- INDEXES
-- ============================================

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_employee_id ON bookings(employee_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_machine_bookings_machine_id ON machine_bookings(machine_id);
CREATE INDEX idx_machine_bookings_start_time ON machine_bookings(start_time);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- ============================================
-- FUNCTIONS
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
DECLARE
    user_role_val user_role;
BEGIN
    -- Get role from metadata, default to 'customer'
    user_role_val := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'customer'::user_role
    );
    
    -- Insert profile with role
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role_val
    );
    
    -- Also insert into user_roles table
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, user_role_val);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Profile trigger
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
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    role user_role;
BEGIN
    SELECT ur.role INTO role
    FROM user_roles ur
    WHERE ur.user_id = user_id
    LIMIT 1;
    RETURN COALESCE(role, 'customer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = $1 AND role = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Owner can view all profiles
CREATE POLICY "Owner can view all profiles"
    ON profiles FOR SELECT
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- USER_ROLES POLICIES
-- ============================================

-- Users can view their own role
CREATE POLICY "Users can view own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Owner can manage all roles
CREATE POLICY "Owner can manage all roles"
    ON user_roles FOR ALL
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- EMPLOYEES POLICIES
-- ============================================

-- Employees can view employee list
CREATE POLICY "Employees can view employee list"
    ON employees FOR SELECT
    USING (
        has_role(auth.uid(), 'employee') OR
        has_role(auth.uid(), 'owner')
    );

-- Owner can manage employees
CREATE POLICY "Owner can manage employees"
    ON employees FOR ALL
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- MACHINES POLICIES
-- ============================================

-- Authenticated users can view machines
CREATE POLICY "Authenticated can view machines"
    ON machines FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Owner can manage machines
CREATE POLICY "Owner can manage machines"
    ON machines FOR ALL
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Customers can update their own bookings (only if pending)
CREATE POLICY "Customers can update own pending bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Employees can view all bookings
CREATE POLICY "Employees can view all bookings"
    ON bookings FOR SELECT
    USING (has_role(auth.uid(), 'employee'));

-- Employees can update booking status
CREATE POLICY "Employees can update booking status"
    ON bookings FOR UPDATE
    USING (has_role(auth.uid(), 'employee'))
    WITH CHECK (has_role(auth.uid(), 'employee'));

-- Owner can view all bookings
CREATE POLICY "Owner can view all bookings"
    ON bookings FOR SELECT
    USING (has_role(auth.uid(), 'owner'));

-- Owner can manage all bookings
CREATE POLICY "Owner can manage all bookings"
    ON bookings FOR ALL
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- MACHINE_BOOKINGS POLICIES
-- ============================================

-- Users can view machine bookings for their bookings
CREATE POLICY "Users can view own machine bookings"
    ON machine_bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id AND b.user_id = auth.uid()
        ) OR
        has_role(auth.uid(), 'employee') OR
        has_role(auth.uid(), 'owner')
    );

-- Employees/Owner can manage machine bookings
CREATE POLICY "Employees can manage machine bookings"
    ON machine_bookings FOR ALL
    USING (
        has_role(auth.uid(), 'employee') OR
        has_role(auth.uid(), 'owner')
    );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id AND b.user_id = auth.uid()
        )
    );

-- Owner can view all payments
CREATE POLICY "Owner can view all payments"
    ON payments FOR SELECT
    USING (has_role(auth.uid(), 'owner'));

-- Owner can manage payments
CREATE POLICY "Owner can manage payments"
    ON payments FOR ALL
    USING (has_role(auth.uid(), 'owner'));

-- ============================================
-- NOTIFICATION_SETTINGS POLICIES
-- ============================================

-- Users can view their own notification settings
CREATE POLICY "Users can view own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notification settings
CREATE POLICY "Users can update own notification settings"
    ON notification_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
