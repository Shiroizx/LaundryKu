# LaundryKu — Supabase Database Documentation

> **Project**: LaundryKu (Laundry Management System)  
> **Stack**: Next.js App Router + Supabase (PostgreSQL + Auth + RLS)  
> **Supabase URL**: `https://pbqrdjoyhoinnziiqdsu.supabase.co`  
> **Last updated**: 2026-05-19

---

## 1. Overview

LaundryKu is a multi-role laundry management web application. It uses **Supabase** as a Backend-as-a-Service providing:

- **Authentication** via `auth.users` (email/password sign-up)
- **PostgreSQL database** with Row Level Security (RLS) on all tables
- **Realtime** subscriptions (optional)

### Roles

| Role       | Description                                      | Dashboard Route |
|------------|--------------------------------------------------|-----------------|
| `customer` | End-users who place laundry orders and bookings  | `/customer`     |
| `employee` | Staff who process orders, manage machines        | `/employee`     |
| `owner`    | Admin/owner with full access to everything       | `/owner`        |

Roles are stored as a PostgreSQL ENUM `user_role` and persisted in the `profiles.role` column. The role is also passed as `raw_user_meta_data.role` during sign-up.

---

## 2. Enum Types

```sql
CREATE TYPE user_role       AS ENUM ('customer', 'employee', 'owner');
CREATE TYPE booking_status  AS ENUM ('pending', 'washing', 'ironing', 'finished', 'picked_up', 'cancelled');
CREATE TYPE machine_status  AS ENUM ('available', 'in_use', 'maintenance');
CREATE TYPE machine_type    AS ENUM ('washing_machine', 'dryer', 'iron');
CREATE TYPE service_type    AS ENUM ('self_service', 'full_service', 'express');
CREATE TYPE payment_status  AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method  AS ENUM ('cash', 'bank_transfer', 'e_wallet');
```

> **Note (TypeScript vs SQL mismatch)**: The TypeScript types in `src/lib/supabase/types.ts` define additional/different enum values than the SQL enums above (e.g. `OrderStatus` has more values, `MachineType` uses `'washing'` instead of `'washing_machine'`). The **SQL enums above are the source of truth** for what the database actually accepts. If you add new enum values, you must `ALTER TYPE ... ADD VALUE` in the database first.

---

## 3. Tables

### 3.1 `profiles` — User Profiles

Extends `auth.users`. Created automatically by the `on_auth_user_created` trigger.

| Column       | Type          | Constraints                                | Default       |
|--------------|---------------|--------------------------------------------|---------------|
| `id`         | `UUID`        | **PK**, FK → `auth.users(id)` ON DELETE CASCADE | —             |
| `email`      | `TEXT`        | NOT NULL                                   | —             |
| `full_name`  | `TEXT`        | NOT NULL                                   | —             |
| `phone`      | `TEXT`        | nullable                                   | —             |
| `avatar_url` | `TEXT`        | nullable                                   | —             |
| `role`       | `user_role`   |                                            | `'customer'`  |
| `created_at` | `TIMESTAMPTZ` |                                            | `NOW()`       |
| `updated_at` | `TIMESTAMPTZ` |                                            | `NOW()`       |

**Indexes**: `idx_profiles_email` on `email`

---

### 3.2 `machines` — Laundry Machines

| Column         | Type            | Constraints    | Default        |
|----------------|-----------------|----------------|----------------|
| `id`           | `UUID`          | **PK**         | `gen_random_uuid()` |
| `machine_number` | `TEXT`        | NOT NULL, UNIQUE | —             |
| `machine_type` | `machine_type`  | NOT NULL       | —              |
| `brand`        | `TEXT`          | nullable       | —              |
| `capacity_kg`  | `DECIMAL(5,2)`  | nullable       | —              |
| `status`       | `machine_status`|                | `'available'`  |
| `created_at`   | `TIMESTAMPTZ`   |                | `NOW()`        |
| `updated_at`   | `TIMESTAMPTZ`   |                | `NOW()`        |

---

### 3.3 `employees` — Employee Records

| Column         | Type            | Constraints                                | Default   |
|----------------|-----------------|----------------------------------------------|-----------|
| `id`           | `UUID`          | **PK**                                       | `gen_random_uuid()` |
| `user_id`      | `UUID`          | NOT NULL, UNIQUE, FK → `profiles(id)` CASCADE | —         |
| `employee_code`| `TEXT`          | NOT NULL, UNIQUE                             | —         |
| `position`     | `TEXT`          | NOT NULL                                     | —         |
| `shift`        | `TEXT`          | CHECK (`morning`, `afternoon`, `night`)      | —         |
| `hourly_rate`  | `DECIMAL(10,2)` |                                              | `0`       |
| `is_active`    | `BOOLEAN`       |                                              | `TRUE`    |
| `hire_date`    | `DATE`          | nullable                                     | —         |
| `created_at`   | `TIMESTAMPTZ`   |                                              | `NOW()`   |
| `updated_at`   | `TIMESTAMPTZ`   |                                              | `NOW()`   |

**Indexes**: `idx_employees_user_id` on `user_id`

---

### 3.4 `bookings` — Laundry Orders/Bookings

| Column         | Type             | Constraints                                 | Default     |
|----------------|------------------|----------------------------------------------|-------------|
| `id`           | `UUID`           | **PK**                                       | `gen_random_uuid()` |
| `booking_code` | `TEXT`           | NOT NULL, UNIQUE (auto-generated by trigger) | —           |
| `user_id`      | `UUID`           | NOT NULL, FK → `profiles(id)` CASCADE        | —           |
| `employee_id`  | `UUID`           | nullable, FK → `employees(id)`               | —           |
| `service_type` | `service_type`   | NOT NULL                                     | —           |
| `status`       | `booking_status` |                                              | `'pending'` |
| `weight_kg`    | `DECIMAL(5,2)`   | nullable                                     | —           |
| `notes`        | `TEXT`           | nullable                                     | —           |
| `pickup_time`  | `TIMESTAMPTZ`    | nullable                                     | —           |
| `total_amount` | `DECIMAL(10,2)`  |                                              | `0`         |
| `qr_code`      | `TEXT`           | nullable                                     | —           |
| `created_at`   | `TIMESTAMPTZ`    |                                              | `NOW()`     |
| `updated_at`   | `TIMESTAMPTZ`    |                                              | `NOW()`     |

**Indexes**: `idx_bookings_user_id`, `idx_bookings_employee_id`, `idx_bookings_status`, `idx_bookings_created_at`

**Auto-generated**: `booking_code` is generated by the `generate_booking_code` trigger as `'LY-' + 8 random hex chars` (e.g. `LY-A1B2C3D4`).

---

### 3.5 `machine_bookings` — Machine Usage Slots

| Column       | Type          | Constraints                                        | Default             |
|--------------|---------------|----------------------------------------------------|---------------------|
| `id`         | `UUID`        | **PK**                                             | `gen_random_uuid()` |
| `booking_id` | `UUID`        | NOT NULL, FK → `bookings(id)` CASCADE              | —                   |
| `machine_id` | `UUID`        | NOT NULL, FK → `machines(id)` CASCADE              | —                   |
| `start_time` | `TIMESTAMPTZ` | NOT NULL                                           | —                   |
| `end_time`   | `TIMESTAMPTZ` | nullable                                           | —                   |
| `created_at` | `TIMESTAMPTZ` |                                                    | `NOW()`             |

**Unique constraint**: `(machine_id, start_time)` — prevents double-booking.

**Indexes**: `idx_machine_bookings_machine_id`, `idx_machine_bookings_start_time`

---

### 3.6 `payments` — Payment Records

| Column          | Type             | Constraints                           | Default             |
|-----------------|------------------|---------------------------------------|---------------------|
| `id`            | `UUID`           | **PK**                                | `gen_random_uuid()` |
| `booking_id`    | `UUID`           | NOT NULL, FK → `bookings(id)` CASCADE | —                   |
| `amount`        | `DECIMAL(10,2)`  | NOT NULL                              | —                   |
| `method`        | `payment_method` |                                       | `'cash'`            |
| `status`        | `payment_status` |                                       | `'pending'`         |
| `transaction_id`| `TEXT`           | nullable                              | —                   |
| `paid_at`       | `TIMESTAMPTZ`    | nullable                              | —                   |
| `created_at`    | `TIMESTAMPTZ`    |                                       | `NOW()`             |
| `updated_at`    | `TIMESTAMPTZ`    |                                       | `NOW()`             |

**Indexes**: `idx_payments_booking_id`

---

### 3.7 `notification_settings` — User Notification Preferences

| Column                | Type      | Constraints                           | Default |
|-----------------------|-----------|---------------------------------------|---------|
| `id`                  | `UUID`    | **PK**                                | `gen_random_uuid()` |
| `user_id`             | `UUID`    | NOT NULL, FK → `profiles(id)` CASCADE, UNIQUE | —       |
| `email_notifications` | `BOOLEAN` |                                       | `TRUE`  |
| `push_notifications`  | `BOOLEAN` |                                       | `TRUE`  |
| `sms_notifications`   | `BOOLEAN` |                                       | `FALSE` |
| `created_at`          | `TIMESTAMPTZ` |                                   | `NOW()` |

---

### 3.8 `user_roles` — Additional Role Mapping (legacy/fallback)

Created by `migration_fix.sql`. Used as a **fallback** in middleware when `profiles.role` is NULL.

| Column       | Type          | Constraints                                  | Default             |
|--------------|---------------|----------------------------------------------|---------------------|
| `id`         | `UUID`        | **PK**                                       | `gen_random_uuid()` |
| `user_id`    | `UUID`        | NOT NULL, FK → `profiles(id)` CASCADE        | —                   |
| `role`       | `user_role`   | NOT NULL                                     | `'customer'`        |
| `created_at` | `TIMESTAMPTZ` |                                              | `NOW()`             |

**Unique constraint**: `(user_id, role)`

> **Note**: The primary source of user role is `profiles.role`. The `user_roles` table is only queried as a fallback in the middleware (see `src/middleware.ts` lines 71-81).

---

## 4. Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │ id (PK)
         │ 1:1
         ▼
┌─────────────────┐       ┌─────────────────┐
│    profiles     │───1:N─▶│  notification   │
│                 │       │   _settings     │
│  id (PK/FK)    │       └─────────────────┘
│  email         │
│  full_name     │       ┌─────────────────┐
│  role          │◀──────│   user_roles    │
│                │  1:N  │  (fallback)     │
└───┬─────┬──────┘       └─────────────────┘
    │     │
    │     └──────────1:1──▶┌─────────────────┐
    │                      │   employees     │
    │                      │                 │
    │                      │  user_id (FK)   │
    │                      └────────┬────────┘
    │                               │
    │  1:N                          │ 0..1:N
    ▼                               ▼
┌─────────────────┐         (employee_id FK)
│    bookings     │◀────────────────┘
│                 │
│  user_id (FK)   │
│  booking_code   │         ┌─────────────────┐
│  service_type   │    1:N  │    payments     │
│  status         │────────▶│                 │
│  total_amount   │         │  booking_id(FK) │
└───────┬─────────┘         └─────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐        ┌─────────────────┐
│ machine_bookings │───N:1──▶│    machines     │
│                  │        │                 │
│ booking_id (FK)  │        │  machine_number │
│ machine_id (FK)  │        │  machine_type   │
│ start_time       │        │  status         │
└──────────────────┘        └─────────────────┘
```

---

## 5. Triggers & Functions

### 5.1 `handle_new_user()` — Auto-create profile on sign-up

- **Trigger**: `on_auth_user_created` — `AFTER INSERT ON auth.users`
- **What it does**: Inserts a row into `profiles` using data from `raw_user_meta_data` (full_name, phone, role)
- **Security**: `SECURITY DEFINER` with `SET search_path = public`
- **Error handling**: Has nested exception blocks so it **never** crashes `auth.users` INSERT
- **Conflict strategy**: `ON CONFLICT (id) DO UPDATE` — updates email, full_name, role

```sql
-- The signUp call passes metadata like this:
supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            full_name: 'John Doe',
            phone: '08123456789',
            role: 'customer'     -- must match user_role enum
        }
    }
})
```

### 5.2 `generate_booking_code()` — Auto-generate booking codes

- **Trigger**: `generate_booking_code_trigger` — `BEFORE INSERT ON bookings`
- **Format**: `LY-` + 8 uppercase hex characters (e.g. `LY-A1B2C3D4`)

### 5.3 `update_updated_at_column()` — Auto-update timestamps

- **Triggers on**: `profiles`, `bookings`, `machines`, `employees`, `payments`
- **Fires**: `BEFORE UPDATE`

---

## 6. Row Level Security (RLS) Policies

All tables have RLS **enabled**. Below is a summary:

### `profiles`
| Policy                | Operation | Rule                        |
|-----------------------|-----------|-----------------------------|
| `profiles_select_own` | SELECT    | `auth.uid() = id`           |
| `profiles_update_own` | UPDATE    | `auth.uid() = id`           |
| `profiles_insert_auth`| INSERT    | `auth.uid() IS NOT NULL`    |

### `machines`
| Policy                 | Operation | Rule                              |
|------------------------|-----------|-----------------------------------|
| `machines_select_auth` | SELECT    | `auth.uid() IS NOT NULL`          |
| `machines_all_owner`   | ALL       | User has role `'owner'`           |

### `employees`
| Policy                  | Operation | Rule                             |
|-------------------------|-----------|----------------------------------|
| `employees_select_auth` | SELECT    | `auth.uid() IS NOT NULL`         |
| `employees_all_owner`   | ALL       | User has role `'owner'`          |

### `bookings`
| Policy                     | Operation | Rule                                      |
|----------------------------|-----------|--------------------------------------------|
| `bookings_select_own`      | SELECT    | `auth.uid() = user_id`                     |
| `bookings_insert_auth`     | INSERT    | `auth.uid() = user_id`                     |
| `bookings_update_own`      | UPDATE    | `auth.uid() = user_id AND status='pending'`|
| `bookings_select_employee` | SELECT    | Role is `employee` or `owner`              |
| `bookings_update_employee` | UPDATE    | Role is `employee` or `owner`              |

### `machine_bookings`
| Policy                           | Operation | Rule                         |
|----------------------------------|-----------|------------------------------|
| `machine_bookings_select_auth`   | SELECT    | `auth.uid() IS NOT NULL`     |
| `machine_bookings_all_employee`  | ALL       | Role is `employee` or `owner`|

### `payments`
| Policy               | Operation | Rule                                      |
|----------------------|-----------|-------------------------------------------|
| `payments_select_own`| SELECT    | User owns the linked booking              |
| `payments_all_owner` | ALL       | User has role `'owner'`                   |

### `notification_settings`
| Policy                       | Operation | Rule                |
|------------------------------|-----------|---------------------|
| `notification_settings_own`  | ALL       | `auth.uid() = user_id` |

### `user_roles`
| Policy                     | Operation | Rule                                        |
|----------------------------|-----------|---------------------------------------------|
| `Users can view own role`  | SELECT    | `auth.uid() = user_id`                      |
| `Owner can insert roles`   | INSERT    | Own user OR role is `'owner'`               |

---

## 7. Permissions (GRANT)

```sql
-- service_role: Full access to all tables (bypasses RLS)
GRANT ALL ON [all tables] TO service_role;

-- authenticated users:
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT SELECT ON machines TO authenticated;
GRANT SELECT ON employees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON machine_bookings TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT ALL ON notification_settings TO authenticated;

-- Auth admin (for trigger function):
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON profiles TO supabase_auth_admin;
```

---

## 8. Authentication Flow

### Sign Up
1. Client calls `supabase.auth.signUp()` with email, password, and metadata (`full_name`, `phone`, `role`)
2. Supabase creates a row in `auth.users`
3. The `on_auth_user_created` trigger fires → `handle_new_user()` inserts a `profiles` row
4. If email confirmation is disabled, a session is returned immediately
5. The client additionally does an upsert to `profiles` to ensure role/phone are set

### Login
1. Client calls `supabase.auth.signInWithPassword()`
2. Server action fetches `profiles.role` to determine dashboard redirect
3. Middleware reads the role on every request for route protection

### Middleware Route Protection
- `/owner/*` → requires `role = 'owner'`
- `/employee/*` → requires `role = 'employee'` or `'owner'`
- `/customer/*` → requires any authenticated user
- `/login`, `/register`, `/` → public routes
- Authenticated users on auth pages → redirected to their dashboard

---

## 9. Supabase Client Setup

| Context           | File                              | Key Used           |
|-------------------|-----------------------------------|--------------------|
| Server Components | `src/lib/supabase/server.ts`      | `ANON_KEY`         |
| Server Actions    | `src/lib/supabase/server.ts`      | `ANON_KEY`         |
| Middleware        | `src/middleware.ts`               | `ANON_KEY`         |
| Client Components | `src/lib/supabase/client.ts`      | `ANON_KEY`         |

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://pbqrdjoyhoinnziiqdsu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # only for admin operations
```

---

## 10. TypeScript Types

Types are defined in `src/lib/supabase/types.ts`. This file contains:

- **Enum types**: `UserRole`, `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `MachineStatus`, `MachineType`, `BookingStatus`
- **Table interfaces**: `Profile`, `Employee`, `Machine`, `MachineSchedule`, `Shift`, `Service`, `Order`, `OrderStatusHistory`, `MachineBooking`, `Payment`, `Review`, `Notification`, `Setting`
- **Relationship types**: `OrderWithRelations`, `OrderWithCustomer`, `PaymentWithDetails`, etc.
- **Form input types**: `CreateOrderInput`, `CreateBookingInput`, `CreatePaymentInput`, etc.
- **Database type**: Full `Database` type for Supabase client generics

> **Important**: The TypeScript types define **more tables** than currently exist in the database (e.g. `orders`, `services`, `reviews`, `notifications`, `settings`, `shifts`, `machine_schedules`, `order_status_history`). These are **planned/future tables**. Only the tables listed in Section 3 actually exist in the database right now.

---

## 11. Tables That Exist vs TypeScript Types

### ✅ Currently Exist in Database
| Table                  | TypeScript Interface |
|------------------------|---------------------|
| `profiles`             | `Profile`           |
| `machines`             | `Machine` (partial match) |
| `employees`            | `Employee` (partial match) |
| `bookings`             | — (uses `Order`-like flow) |
| `machine_bookings`     | `MachineBooking` (partial match) |
| `payments`             | `Payment` (partial match) |
| `notification_settings`| — (no TypeScript type) |
| `user_roles`           | — (no TypeScript type) |

### ❌ Only in TypeScript Types (NOT in database yet)
| TypeScript Interface   | Planned Table          |
|------------------------|------------------------|
| `Service`              | `services`             |
| `Order`                | `orders`               |
| `OrderStatusHistory`   | `order_status_history` |
| `Shift`                | `shifts`               |
| `MachineSchedule`      | `machine_schedules`    |
| `Review`               | `reviews`              |
| `Notification`         | `notifications`        |
| `Setting`              | `settings`             |

---

## 12. Known Issues & Gotchas

1. **Trigger `handle_new_user()` can crash registration** if it doesn't have proper error handling or `search_path` set. Always use `SECURITY DEFINER SET search_path = public` and wrap in exception handlers. See `supabase/fix_trigger.sql` for the fixed version.

2. **TypeScript types are aspirational** — they define more tables/columns than actually exist. Always verify against the actual database before querying.

3. **Enum mismatches** — SQL enums and TypeScript enums don't always match:
   - SQL `machine_type`: `washing_machine`, `dryer`, `iron`
   - TS `MachineType`: `washing`, `drying`, `ironing`, `combo`
   - SQL `booking_status`: `pending`, `washing`, `ironing`, `finished`, `picked_up`, `cancelled`
   - TS `BookingStatus`: `reserved`, `in_use`, `completed`, `cancelled`, `no_show`

4. **`user_roles` table is a fallback** — primary role source is `profiles.role`. The middleware checks `user_roles` only if `profiles.role` is NULL.

5. **RLS is enabled on all tables** — queries using the `anon` key will be filtered by policies. Use `service_role` key to bypass RLS for admin operations.

---

## 13. SQL Migration Files

| File                          | Purpose                                         |
|-------------------------------|--------------------------------------------------|
| `supabase/complete_schema.sql`| Full schema creation (destructive — drops all)   |
| `supabase/migration_fix.sql`  | Migration to add role column + user_roles table   |
| `supabase/simple_fix.sql`     | Simplified trigger fix                            |
| `supabase/fix_trigger.sql`    | Latest trigger fix with error handling            |
