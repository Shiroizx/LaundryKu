-- Migration: Sistem Pembayaran Manual & Verifikasi

-- 1. Create store_payment_methods table
CREATE TABLE IF NOT EXISTS store_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    is_qris BOOLEAN DEFAULT false,
    qris_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for store_payment_methods
ALTER TABLE store_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for store_payment_methods
-- Authenticated users (customers/employees) can read active payment methods
CREATE POLICY "store_payment_methods_select_auth"
ON store_payment_methods FOR SELECT
TO authenticated
USING (is_active = true OR (auth.jwt() ->> 'role') = 'owner');

-- Only Owner can insert/update/delete
CREATE POLICY "store_payment_methods_all_owner"
ON store_payment_methods FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
    )
);

-- 2. Add columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_code TEXT;

-- We also need an 'on_site' payment method if it doesn't exist in enum.
-- The enum 'payment_method' has: 'cash', 'bank_transfer', 'e_wallet'.
-- We can map 'Bayar di Tempat' to 'cash' to avoid altering enum type.

-- 3. Storage Bucket for Payment Proofs
-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_proofs', 
  'payment_proofs', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Bucket (payment_proofs)
-- Allow public access for reading images
CREATE POLICY "Public Access to Payment Proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment_proofs');

-- Allow authenticated users to upload proofs
CREATE POLICY "Auth Users Upload Payment Proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'payment_proofs'
);

-- Allow owner to manage (delete/update) proofs if necessary
CREATE POLICY "Owner Manage Payment Proofs"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'payment_proofs' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
    )
);
