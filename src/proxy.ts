import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase client for Next.js Middleware
 * Handles authentication and role-based route protection
 */
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Skip middleware for static files and API routes that don't need auth
    const isStaticFile = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/favicon') ||
        request.nextUrl.pathname.startsWith('/public') ||
        request.nextUrl.pathname.includes('.')

    if (isStaticFile) {
        return response
    }

    // Create Supabase client for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
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

    // Refresh session
    const { data: { user }, error } = await supabase.auth.getUser()

    // Get user profile
    let userRole: string | null = null
    let userId: string | null = null
    let userName: string | null = null

    if (user && !error) {
        // Get role from profiles table (since we added role column)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .single()

        userRole = profile?.role ?? null
        userId = profile?.id ?? null
        userName = profile?.full_name ?? null

        // If no role in profiles, try to get from user_roles table
        if (!userRole) {
            const { data: userRoleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .limit(1)
                .single()

            userRole = userRoleData?.role ?? null
        }
    }

    // Route definitions
    const publicRoutes = ['/', '/login', '/register']
    const publicPrefixes = ['/qr/']
    const authRoutes = ['/login', '/register']

    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)
    const isPublicPrefix = publicPrefixes.some(prefix =>
        request.nextUrl.pathname.startsWith(prefix)
    )
    const isAuthRoute = authRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    const isEmployeeOnly = request.nextUrl.pathname.startsWith('/employee')
    const isOwnerOnly = request.nextUrl.pathname.startsWith('/owner')

    // Redirect to login if accessing protected route without auth
    if (!isPublicRoute && !isPublicPrefix && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = userRole === 'owner' ? '/owner' :
            userRole === 'employee' ? '/employee' :
                '/customer'
        return NextResponse.redirect(url)
    }

    // Role-based access control
    if (isOwnerOnly && userRole !== 'owner') {
        const url = request.nextUrl.clone()
        url.pathname = userRole === 'employee' ? '/employee' : '/customer'
        return NextResponse.redirect(url)
    }

    if (isEmployeeOnly && userRole !== 'employee' && userRole !== 'owner') {
        const url = request.nextUrl.clone()
        url.pathname = '/customer'
        return NextResponse.redirect(url)
    }

    // Add user info to response headers
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

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}