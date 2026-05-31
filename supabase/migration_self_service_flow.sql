-- Migration: Update RLS policies for self-service status updates (washing -> ironing -> finished)
-- Enforce that customers can only update self-service booking status if the payment status is 'paid' (Lunas).
-- Use a SECURITY DEFINER function to break RLS infinite recursion between bookings and payments.

-- 1. Create a helper function to check payment status bypassing RLS
CREATE OR REPLACE FUNCTION public.check_booking_payment_paid(booking_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.payments 
        WHERE payments.booking_id = booking_uuid 
        AND payments.status = 'paid'
    );
END;
$$;

-- Grant execute permissions on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.check_booking_payment_paid(UUID) TO authenticated;

-- 2. Drop and recreate bookings policy using the helper function
DROP POLICY IF EXISTS "bookings_update_own" ON bookings;

CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE USING (
    auth.uid() = user_id 
    AND (
        status = 'pending' 
        OR (
            service_type = 'self_service' 
            AND status IN ('washing', 'ironing')
            AND public.check_booking_payment_paid(id)
        )
    )
) WITH CHECK (
    auth.uid() = user_id 
    AND (
        status = 'pending' 
        OR (
            service_type = 'self_service' 
            AND status IN ('washing', 'ironing', 'finished')
            AND public.check_booking_payment_paid(id)
        )
    )
);

-- 3. Allow authenticated users to update their own machine_bookings (to set end_time when releasing machines)
DROP POLICY IF EXISTS "machine_bookings_update_own" ON machine_bookings;

CREATE POLICY "machine_bookings_update_own" ON machine_bookings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_id 
        AND bookings.user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_id 
        AND bookings.user_id = auth.uid()
    )
);
