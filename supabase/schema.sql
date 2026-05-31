# ============================================================
# LAUNDRY MANAGEMENT SYSTEM - NEXT.JS APP ROUTER STRUCTURE
# Monolith Architecture with Supabase
# ============================================================

src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group route (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Minimal layout for auth pages
│   │
│   ├── (dashboard)/              # Protected dashboard group
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │
│   │   ├── customer/             # Customer dashboard
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx      # Order list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Order detail
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  # New order form
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx      # Machine bookings list
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  # New booking form
│   │   │   ├── tracking/
│   │   │   │   └── page.tsx      # Real-time tracking
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx      # Payment history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Payment detail
│   │   │   └── profile/
│   │   │       └── page.tsx      # Customer profile
│   │   │
│   │   ├── employee/             # Employee dashboard
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx      # Incoming orders
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Order detail
│   │   │   │   └── update/
│   │   │   │       └── page.tsx  # Status update
│   │   │   ├── queue/
│   │   │   │   └── page.tsx      # Today's queue
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx      # Work schedule
│   │   │   └── scan/
│   │   │       └── page.tsx      # QR code scanner
│   │   │
│   │   └── owner/                # Owner/Admin dashboard
│   │       ├── page.tsx          # Dashboard home
│   │       ├── orders/
│   │       │   ├── page.tsx      # All orders
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── employees/
│   │       │   ├── page.tsx      # Employee list
│   │       │   ├── new/
│   │       │   │   └── page.tsx  # Add employee
│   │       │   └── [id]/
│   │       │       ├── page.tsx  # Employee detail
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       ├── shifts/
│   │       │   ├── page.tsx      # Shift management
│   │       │   └── manage/
│   │       │       └── page.tsx  # Assign shifts
│   │       ├── machines/
│   │       │   ├── page.tsx      # Machine overview
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx  # Machine detail
│   │       │   └── manage/
│   │       │       └── page.tsx  # Machine management
│   │       ├── transactions/
│   │       │   ├── page.tsx      # Transaction overview
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── reports/
│   │       │   ├── page.tsx      # Reports dashboard
│   │       │   ├── revenue/
│   │       │   │   └── page.tsx  # Revenue report
│   │       │   └── machines/
│   │       │       └── page.tsx  # Machine usage report
│   │       └── settings/
│   │           └── page.tsx      # System settings
│   │
│   ├── qr/                       # QR code lookup (public)
│   │   └── [code]/
│   │       └── page.tsx          # Track by QR code
│   │
│   ├── api/                      # API Route Handlers
│   │   ├── auth/
│   │   │   └── [...supabase]/
│   │   │       └── route.ts      # Supabase auth callbacks
│   │   ├── webhooks/
│   │   │   └── payment/
│   │   │       └── route.ts      # Payment gateway webhook
│   │   └── payments/
│   │       └── midtrans/
│   │           └── route.ts      # Midtrans integration
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── page.tsx                  # Landing/home page
│
├── components/                   # Shared React components
│   ├── ui/                       # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── spinner.tsx
│   │   ├── skeleton.tsx
│   │   └── alert.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── stat-card.tsx
│   │   ├── recent-orders.tsx
│   │   ├── order-status-badge.tsx
│   │   ├── status-timeline.tsx
│   │   ├── machine-card.tsx
│   │   ├── machine-status-grid.tsx
│   │   ├── employee-card.tsx
│   │   └── shift-calendar.tsx
│   │
│   ├── orders/                   # Order-related components
│   │   ├── order-form.tsx
│   │   ├── order-card.tsx
│   │   ├── order-list.tsx
│   │   ├── order-status-update.tsx
│   │   └── order-tracker.tsx
│   │
│   ├── booking/                  # Booking components
│   │   ├── booking-form.tsx
│   │   ├── booking-calendar.tsx
│   │   ├── machine-selector.tsx
│   │   └── time-slot-picker.tsx
│   │
│   ├── qr/                       # QR code components
│   │   ├── qr-generator.tsx
│   │   ├── qr-scanner.tsx
│   │   └── qr-display.tsx
│   │
│   ├── payments/                 # Payment components
│   │   ├── payment-form.tsx
│   │   ├── payment-summary.tsx
│   │   └── payment-method-selector.tsx
│   │
│   ├── charts/                   # Chart components
│   │   ├── revenue-chart.tsx
│   │   ├── orders-chart.tsx
│   │   └── machine-usage-chart.tsx
│   │
│   └── providers/                # Context providers
│       ├── supabase-provider.tsx
│       ├── auth-provider.tsx
│       └── toast-provider.tsx
│
├── lib/                          # Core libraries
│   ├── supabase/                 # Supabase integration
│   │   ├── client.ts             # Browser client (createBrowserClient)
│   │   ├── server.ts             # Server client (createServerClient)
│   │   ├── middleware.ts         # Middleware client
│   │   ├── types.ts               # Database types
│   │   └── helpers.ts            # Query helpers
│   │
│   ├── utils/                    # Utility functions
│   │   ├── format.ts              # Date, currency formatters
│   │   ├── cn.ts                  # Class name merger (clsx + twMerge)
│   │   ├── generate.ts             # ID/order number generators
│   │   └── validation.ts          # Zod schemas
│   │
│   ├── constants/                # App constants
│   │   ├── routes.ts              # Route paths
│   │   ├── order-status.ts         # Status configurations
│   │   └── config.ts              # App configuration
│   │
│   └── types/                    # TypeScript definitions
│       ├── database.types.ts      # Supabase generated types
│       ├── next.types.ts          # Next.js types
│       └── index.ts               # Re-exports
│
├── actions/                      # Server Actions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   ├── update-profile.ts
│   │   └── get-session.ts
│   │
│   ├── orders/
│   │   ├── create-order.ts
│   │   ├── get-orders.ts
│   │   ├── get-order.ts
│   │   ├── update-order-status.ts
│   │   ├── cancel-order.ts
│   │   └── assign-employee.ts
│   │
│   ├── bookings/
│   │   ├── create-booking.ts
│   │   ├── get-bookings.ts
│   │   ├── get-available-slots.ts
│   │   └── cancel-booking.ts
│   │
│   ├── machines/
│   │   ├── get-machines.ts
│   │   ├── get-machine-status.ts
│   │   ├── update-machine-status.ts
│   │   └── get-machine-schedules.ts
│   │
│   ├── employees/
│   │   ├── get-employees.ts
│   │   ├── create-employee.ts
│   │   ├── update-employee.ts
│   │   ├── delete-employee.ts
│   │   ├── get-shifts.ts
│   │   └── manage-shifts.ts
│   │
│   ├── services/
│   │   ├── get-services.ts
│   │   ├── create-service.ts
│   │   ├── update-service.ts
│   │   └── delete-service.ts
│   │
│   ├── payments/
│   │   ├── create-payment.ts
│   │   ├── get-payments.ts
│   │   ├── verify-payment.ts
│   │   └── process-refund.ts
│   │
│   ├── reviews/
│   │   ├── create-review.ts
│   │   └── get-reviews.ts
│   │
│   └── notifications/
│       ├── get-notifications.ts
│       ├── mark-as-read.ts
│       └── create-notification.ts
│
├── hooks/                        # Custom React hooks
│   ├── use-user.ts               # Current user hook
│   ├── use-role.ts               # Role checking hook
│   ├── use-orders.ts              # Orders data hook
│   ├── use-machines.ts            # Machines data hook
│   ├── use-bookings.ts            # Bookings data hook
│   ├── use-payments.ts            # Payments hook
│   ├── use-realtime.ts            # Supabase realtime hook
│   ├── use-toast.ts               # Toast notification hook
│   └── use-qr-scanner.ts          # QR scanner hook
│
├── middleware.ts                  # Next.js middleware (auth + roles)
│
├── types/                         # Global TypeScript types
│   ├── next-auth.d.ts            # Auth type extensions
│   └── global.d.ts               # Global declarations
│
public/                            # Static assets
│   ├── icons/
│   └── images/
│
├── .env.local                     # Environment variables (gitignored)
└── next.config.ts                 # Next.js config
