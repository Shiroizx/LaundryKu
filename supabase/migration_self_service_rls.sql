-- Drop the existing policy
DROP POLICY IF EXISTS "bookings_update_own" ON bookings;

-- Recreate policy to allow customers to update their own bookings if status is 'pending', 
-- or if it's a 'self_service' booking and current status is 'washing'
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE USING (
    auth.uid() = user_id 
    AND (
        status = 'pending' 
        OR (service_type = 'self_service' AND status = 'washing')
    )
);
