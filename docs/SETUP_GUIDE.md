# 📋 Setup Guide - Sistem Informasi Manajemen Laundry

## 📦 Tahap 1: Setup yang Telah Selesai

### 1. Database Schema (Supabase)
File: `supabase/schema.sql`

Berisi:
- 13 tabel dengan relasi lengkap (profiles, employees, machines, orders, payments, dll)
- 6 enum types (user_role, order_status, payment_status, machine_status, machine_type, booking_status)
- 6 triggers (auto-update timestamps, generate order/booking/payment numbers, auto-create profile)
- 50+ Row Level Security policies untuk 3 role
- Seed data untuk services, machines, dan settings

### 2. Struktur Folder Next.js App Router
File: `docs/FOLDER_STRUCTURE.md`

Struktur modular dengan:
- Route groups: `(auth)`, `(dashboard)`
- Dashboard per role: `customer/`, `employee/`, `owner/`
- Components: `ui/`, `layout/`, `dashboard/`, `orders/`, `booking/`, `qr/`, `payments/`
- Server Actions: `actions/auth/`, `actions/orders/`, `actions/bookings/`, dll
- Hooks: `use-user.ts`, `use-realtime.ts`, `use-qr-scanner.ts`, dll

### 3. Supabase Integration Files
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client (RSC, Route Handlers)
- `src/lib/supabase/actions.ts` - Server Actions client
- `src/lib/supabase/middleware.ts` - Middleware helper
- `src/lib/supabase/types.ts` - Database types lengkap
- `src/lib/supabase/index.ts` - Central exports

### 4. Middleware (Route Protection)
File: `src/middleware.ts`

Proteksi route berdasarkan:
- Authentication (redirect ke `/login`)
- Role-based access (customer/employee/owner)
- Headers untuk user info

### 5. Providers & Hooks
- `src/components/providers/auth-provider.tsx` - Auth context
- `src/components/providers/toast-provider.tsx` - Toast notifications
- `src/components/providers/supabase-provider.tsx` - Supabase context
- `src/hooks/use-realtime.ts` - Realtime subscriptions
- `src/hooks/use-qr-scanner.ts` - QR code scanning

### 6. Utilities & Constants
- `src/lib/utils/index.ts` - Formatters, generators, helpers
- `src/lib/constants/index.ts` - Status configs, labels

---

## 🚀 Tahap 2: Setup di Supabase Dashboard

### 1. Buat Project baru di Supabase
1. Kunjungi https://app.supabase.com
2. Buat project baru
3. Copy **Project URL** dan **API Key** (anon key)

### 2. Jalankan SQL Schema
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy isi file `supabase/schema.sql`
3. Paste dan execute

### 3. Konfigurasi Auth
1. Buka **Authentication** > **Settings**
2. Configure:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/login`
3. Enable providers yang diperlukan (Email, Google, dll)

### 4. Enable Realtime
1. Buka **Database** > **Replication**
2. Enable replication untuk tabel yang diperlukan

---

## 🔧 Tahap 3: Setup Environment Variables

### 1. Buat file `.env.local`
```bash
cp .env.example .env.local
```

### 2. Isi dengan nilai dari Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="LaundryKu"
```

---

## 📋 Dependencies yang Sudah Terinstall

```json
{
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.49.4",
  "clsx": "^2.1.1",
  "html5-qrcode": "^2.3.8",
  "qrcode.react": "^4.2.0",
  "tailwind-merge": "^3.2.0",
  "zod": "^3.24.2"
}
```

---

## 🎯 Tahap 3: Implementasi Fitur

### A. Auth Pages (Login/Register)
```typescript
// src/app/(auth)/login/page.tsx
// src/app/(auth)/register/page.tsx
```

### B. Dashboard Pages
```typescript
// Customer: src/app/(dashboard)/customer/
// Employee: src/app/(dashboard)/employee/
// Owner: src/app/(dashboard)/owner/
```

### C. Server Actions
```typescript
// actions/auth/login.ts
// actions/auth/register.ts
// actions/orders/create-order.ts
// actions/orders/update-order-status.ts
// actions/bookings/create-booking.ts
```

### D. QR Components
```typescript
// components/qr/qr-generator.tsx (gunakan qrcode.react)
// components/qr/qr-scanner.tsx (gunakan html5-qrcode)
// app/qr/[code]/page.tsx (tracking page)
```

---

## 📊 Role-Based Route Access

| Route | Customer | Employee | Owner |
|-------|----------|----------|-------|
| /customer/* | ✅ | ❌ | ❌ |
| /employee/* | ❌ | ✅ | ✅ |
| /owner/* | ❌ | ❌ | ✅ |
| /login, /register | Public | Public | Public |

---

## 🔗 Link Referensi

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Tailwind CSS](https://tailwindcss.com/)
- [QRCode.react](https://www.npmjs.com/package/qrcode.react)
- [HTML5 QR Code](https://www.npmjs.com/package/html5-qrcode)

---

## ⚠️ Catatan Penting

1. **Database Types**: Untuk production, generate types dengan:
   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/generated-types.ts
   ```

2. **Payment Gateway**: Setup Midtrans untuk payment integration jika diperlukan

3. **RLS Policies**: Pastikan untuk test setiap policy untuk memastikan keamanan data

4. **Environment**: Jangan pernah commit `.env.local` ke git

5. **Realtime**: Enable realtime untuk fitur tracking real-time yang optimal