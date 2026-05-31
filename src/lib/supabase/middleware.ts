import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase Client for Next.js Middleware
 * 
 * Usage:
 * - Protect routes based on authentication
 * - Protect routes based on user role
 * - Redirect unauthenticated users to login
 * - Add user info to headers for server components
 */
export async function updateSession(request: NextRequest) {
    // Create response to modify
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Only run auth for non-static files
    const isStaticFile = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/favicon') ||
        request.nextUrl.pathname.includes('.') ||
        request.nextUrl.pathname.startsWith('/public')

    if (isStaticFile) {
        return response
    }

    // Create Supabase client configured for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
                    // Set cookies on the request
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Set cookies on the response
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh the session - this validates the JWT
    const { data: { user }, error } = await supabase.auth.getUser()

    // Get user profile for role-based access
    let userRole: string | null = null
    let userId: string | null = null
    let userName: string | null = null

    if (user && !error) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .single()

        userRole = profile?.role ?? null
        userId = profile?.id ?? null
        userName = profile?.full_name ?? null
    }

    // Define route access rules
    const publicRoutes = ['/', '/login', '/register', '/qr']
    const authRoutes = ['/login', '/register']
    const customerRoutes = ['/customer']
    const employeeRoutes = ['/employee']
    const ownerRoutes = ['/owner']

    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(`${route}/`)
    )
    const isAuthRoute = authRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )
    const isCustomerRoute = customerRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )
    const isEmployeeRoute = employeeRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )
    const isOwnerRoute = ownerRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without auth
    if (!isPublicRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated user away from auth pages
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        // Redirect based on role
        if (userRole === 'owner') {
            url.pathname = '/owner'
        } else if (userRole === 'employee') {
            url.pathname = '/employee'
        } else {
            url.pathname = '/customer'
        }
        return NextResponse.redirect(url)
    }

    // Role-based access control
    if (isOwnerRoute && userRole !== 'owner') {
        const url = request.nextUrl.clone()
        url.pathname = userRole === 'employee' ? '/employee' : '/customer'
        return NextResponse.redirect(url)
    }

    if (isEmployeeRoute && userRole !== 'employee' && userRole !== 'owner') {
        const url = request.nextUrl.clone()
        url.pathname = '/customer'
        return NextResponse.redirect(url)
    }

    if (isCustomerRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Add user info to response headers for server components to read
    if (userId) {
        response.headers.set('x-user-id', userId)
    }
    if (userRole) {
        response.headers.set('x-user-role', userRole)
    }
    if (userName) {
        response.headers.set('x-user-name', userName)
    }

    return response
}