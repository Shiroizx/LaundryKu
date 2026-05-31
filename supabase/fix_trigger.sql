-- ============================================
-- FIX: Trigger function for user registration
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Recreate the function with proper error handling
-- The key fix: wrap the role cast in an exception handler
-- so it never crashes the auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role;
    v_full_name TEXT;
BEGIN
    -- Safely extract full_name
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Safely extract and cast role with exception handling
    BEGIN
        v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'customer'::public.user_role;
    END;
    
    -- Default to customer if null
    IF v_role IS NULL THEN
        v_role := 'customer'::public.user_role;
    END IF;
    
    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        v_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = EXCLUDED.role;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but DON'T crash - let the user creation succeed
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Verify
SELECT 'Trigger function recreated successfully!' as result;

-- Check trigger exists
SELECT tgname, tgtype FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check profiles table structure
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
