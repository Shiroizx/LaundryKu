-- ============================================
-- SIMPLE FIX: Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create user_role type if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'employee', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- Step 3: Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 4: Create new trigger function
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
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Done! Check result
SELECT 'SUCCESS: Migration complete!' as result;