-- ============================================
-- SEED: Dummy Data Lengkap
-- ============================================
-- Jalankan script ini di Supabase SQL Editor (sebagai postgres/service_role)
-- Urutan: auth.users → profiles (via trigger) → employees → employee_schedules → machines
--
-- PASSWORD untuk semua akun dummy: laundry123
-- ============================================

-- ============================================
-- BAGIAN 1: AUTH USERS (4 akun employee)
-- ============================================
-- Trigger handle_new_user() akan otomatis membuat profiles & user_roles
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    confirmation_token,
    recovery_token
)
VALUES
    (
        'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
        '00000000-0000-0000-0000-000000000000',
        'budi@laundry.com',
        crypt('laundry123', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"role": "employee", "full_name": "Budi Santoso"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        'authenticated', 'authenticated', '', ''
    ),
    (
        'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
        '00000000-0000-0000-0000-000000000000',
        'rina@laundry.com',
        crypt('laundry123', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"role": "employee", "full_name": "Rina Dewi"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        'authenticated', 'authenticated', '', ''
    ),
    (
        'cccccccc-0003-0003-0003-cccccccccccc',
        '00000000-0000-0000-0000-000000000000',
        'citra@laundry.com',
        crypt('laundry123', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"role": "employee", "full_name": "Citra Lestari"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        'authenticated', 'authenticated', '', ''
    ),
    (
        'dddddddd-0004-0004-0004-dddddddddddd',
        '00000000-0000-0000-0000-000000000000',
        'doni@laundry.com',
        crypt('laundry123', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"role": "employee", "full_name": "Doni Prasetyo"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        'authenticated', 'authenticated', '', ''
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BAGIAN 2: IDENTITIES (diperlukan untuk login)
-- ============================================
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
)
VALUES
    (
        'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
        'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
        'budi@laundry.com',
        '{"sub": "aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa", "email": "budi@laundry.com"}'::jsonb,
        'email', NOW(), NOW(), NOW()
    ),
    (
        'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
        'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
        'rina@laundry.com',
        '{"sub": "bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb", "email": "rina@laundry.com"}'::jsonb,
        'email', NOW(), NOW(), NOW()
    ),
    (
        'cccccccc-0003-0003-0003-cccccccccccc',
        'cccccccc-0003-0003-0003-cccccccccccc',
        'citra@laundry.com',
        '{"sub": "cccccccc-0003-0003-0003-cccccccccccc", "email": "citra@laundry.com"}'::jsonb,
        'email', NOW(), NOW(), NOW()
    ),
    (
        'dddddddd-0004-0004-0004-dddddddddddd',
        'dddddddd-0004-0004-0004-dddddddddddd',
        'doni@laundry.com',
        '{"sub": "dddddddd-0004-0004-0004-dddddddddddd", "email": "doni@laundry.com"}'::jsonb,
        'email', NOW(), NOW(), NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BAGIAN 3: PROFILES (jika trigger tidak jalan otomatis)
-- ============================================
INSERT INTO profiles (id, email, full_name, role)
VALUES
    ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'budi@laundry.com',  'Budi Santoso',  'employee'),
    ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'rina@laundry.com',  'Rina Dewi',     'employee'),
    ('cccccccc-0003-0003-0003-cccccccccccc', 'citra@laundry.com', 'Citra Lestari', 'employee'),
    ('dddddddd-0004-0004-0004-dddddddddddd', 'doni@laundry.com',  'Doni Prasetyo', 'employee')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role;

-- ============================================
-- BAGIAN 4: EMPLOYEES (data karyawan)
-- ============================================
INSERT INTO employees (id, user_id, employee_code, position, is_active, hire_date)
VALUES
    ('e1111111-0001-0001-0001-e11111111111', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'EMP-001', 'Operator Laundry', TRUE, '2024-01-15'),
    ('e2222222-0002-0002-0002-e22222222222', 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'EMP-002', 'Operator Laundry', TRUE, '2024-02-01'),
    ('e3333333-0003-0003-0003-e33333333333', 'cccccccc-0003-0003-0003-cccccccccccc', 'EMP-003', 'Operator Senior',  TRUE, '2023-08-10'),
    ('e4444444-0004-0004-0004-e44444444444', 'dddddddd-0004-0004-0004-dddddddddddd', 'EMP-004', 'Operator Laundry', TRUE, '2024-03-20')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BAGIAN 5: JADWAL SHIFT
-- ============================================
-- Kelompok A (Budi & Citra): Senin, Rabu, Jumat, Minggu — 08:00-16:00
-- Kelompok B (Rina & Doni): Selasa, Kamis, Sabtu, Minggu — 08:00-16:00

INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, is_active)
VALUES
    -- Budi (EMP-001): Senin(1), Rabu(3), Jumat(5), Minggu(0)
    ('e1111111-0001-0001-0001-e11111111111', 0, '08:00', '16:00', TRUE),
    ('e1111111-0001-0001-0001-e11111111111', 1, '08:00', '16:00', TRUE),
    ('e1111111-0001-0001-0001-e11111111111', 3, '08:00', '16:00', TRUE),
    ('e1111111-0001-0001-0001-e11111111111', 5, '08:00', '16:00', TRUE),

    -- Rina (EMP-002): Selasa(2), Kamis(4), Sabtu(6), Minggu(0)
    ('e2222222-0002-0002-0002-e22222222222', 0, '08:00', '16:00', TRUE),
    ('e2222222-0002-0002-0002-e22222222222', 2, '08:00', '16:00', TRUE),
    ('e2222222-0002-0002-0002-e22222222222', 4, '08:00', '16:00', TRUE),
    ('e2222222-0002-0002-0002-e22222222222', 6, '08:00', '16:00', TRUE),

    -- Citra (EMP-003): Senin(1), Rabu(3), Jumat(5), Minggu(0)
    ('e3333333-0003-0003-0003-e33333333333', 0, '08:00', '23:00', TRUE),
    ('e3333333-0003-0003-0003-e33333333333', 1, '08:00', '23:00', TRUE),
    ('e3333333-0003-0003-0003-e33333333333', 3, '08:00', '23:00', TRUE),
    ('e3333333-0003-0003-0003-e33333333333', 5, '08:00', '23:00', TRUE),

    -- Doni (EMP-004): Selasa(2), Kamis(4), Sabtu(6), Minggu(0)
    ('e4444444-0004-0004-0004-e44444444444', 0, '08:00', '23:00', TRUE),
    ('e4444444-0004-0004-0004-e44444444444', 2, '08:00', '23:00', TRUE),
    ('e4444444-0004-0004-0004-e44444444444', 4, '08:00', '23:00', TRUE),
    ('e4444444-0004-0004-0004-e44444444444', 6, '08:00', '23:00', TRUE)

ON CONFLICT (employee_id, day_of_week) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time   = EXCLUDED.end_time,
    is_active  = EXCLUDED.is_active;

-- ============================================
-- BAGIAN 6: MESIN
-- ============================================
INSERT INTO machines (machine_number, machine_type, brand, capacity_kg, status)
VALUES
    ('M-001', 'washing_machine', 'LG',      8.0,  'available'),
    ('M-002', 'washing_machine', 'Samsung', 10.0, 'available'),
    ('M-003', 'washing_machine', 'Aqua',    7.0,  'available'),
    ('M-004', 'dryer',           'LG',      8.0,  'available'),
    ('M-005', 'dryer',           'Samsung', 10.0, 'available'),
    ('M-006', 'iron',            'Philips', NULL,  'available')
ON CONFLICT (machine_number) DO UPDATE SET
    brand       = EXCLUDED.brand,
    capacity_kg = EXCLUDED.capacity_kg,
    status      = EXCLUDED.status;

-- ============================================
-- VERIFIKASI (jalankan ini untuk cek hasilnya)
-- ============================================
-- SELECT e.employee_code, p.full_name, p.email,
--        COUNT(es.id) AS jumlah_hari_kerja
-- FROM employees e
-- JOIN profiles p ON p.id = e.user_id
-- LEFT JOIN employee_schedules es ON es.employee_id = e.id
-- GROUP BY e.employee_code, p.full_name, p.email
-- ORDER BY e.employee_code;
