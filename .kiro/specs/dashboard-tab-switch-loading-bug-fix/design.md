# Dashboard Tab Switch Loading Bug Fix Design

## Overview

This design addresses a critical bug where navigation to different dashboard pages results in infinite loading states after the browser tab becomes inactive and then active again. The root cause is Supabase session token expiration during tab inactivity, combined with the lack of automatic session refresh mechanisms when the tab regains focus. When users navigate after tab reactivation, the expired session causes authentication middleware to hang or fail silently, preventing data from loading.

The fix involves implementing a browser visibility API listener that automatically refreshes the Supabase session when the tab becomes active again, ensuring that authentication state remains valid for subsequent navigation and data fetching operations.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user navigates to a different dashboard page after the browser tab has been inactive and then becomes active again
- **Property (P)**: The desired behavior - dashboard pages should load data normally (within 1-3 seconds) after tab reactivation and navigation
- **Preservation**: Existing navigation behavior, refresh functionality, and initial page loads that must remain unchanged by the fix
- **Session Token**: The JWT access token issued by Supabase that expires after a period of inactivity (typically 1 hour)
- **Tab Visibility API**: Browser API (`document.visibilityState`, `visibilitychange` event) that detects when a tab becomes hidden or visible
- **useCustomerDashboard**: The React hook in `src/hooks/use-customer-dashboard.ts` that fetches dashboard data using Supabase client
- **getSupabaseBrowserClient**: The singleton function in `src/lib/supabase/client.ts` that creates and returns the Supabase browser client
- **middleware.ts**: The Next.js middleware in `src/middleware.ts` that handles authentication and role-based access control

## Bug Details

### Bug Condition

The bug manifests when a user navigates to a different dashboard page (e.g., from `/customer` to `/customer/orders`, or to `/customer/bookings`) after the browser tab has been inactive (switched to another tab or application) and then becomes active again. The Supabase session token expires during the inactivity period, and when the user navigates, the middleware's `supabase.auth.getUser()` call either hangs indefinitely or returns stale session data, causing the page to display a loading indicator without ever completing the data fetch.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type NavigationEvent
  OUTPUT: boolean
  
  RETURN input.isNavigation = true
         AND input.targetPage IN ['/customer/orders', '/customer/bookings', '/customer/payments', '/customer/profile', '/customer/tracking']
         AND tabWasInactive(input.timestamp)
         AND sessionTokenExpired()
         AND NOT sessionRefreshedAfterTabActivation()
END FUNCTION
```

### Examples

- **Example 1**: User opens customer dashboard at 9:00 AM, switches to email tab at 9:05 AM, returns to dashboard tab at 10:30 AM (after 1.5 hours), clicks "Riwayat Pesanan" link → Page shows infinite loading spinner, data never loads
- **Example 2**: User opens customer dashboard, switches to another application for 2 hours, returns to browser, clicks "Lacak Pesanan" → Page displays loading state indefinitely
- **Example 3**: User has dashboard open, laptop goes to sleep for several hours, wakes laptop, returns to dashboard tab, navigates to profile page → Loading indicator appears but page never renders
- **Edge Case**: User switches tabs for only 5 minutes (session still valid), returns and navigates → Expected behavior: page loads normally without issues

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Navigation between dashboard pages while the tab remains continuously active must continue to work normally with fast data loading
- Hard refresh (Ctrl + Shift + R) on any dashboard page must continue to load and display data correctly
- Initial page load after login must continue to display dashboard data without issues
- Mouse clicks, button interactions, and all UI functionality must remain unchanged
- Real-time subscriptions to Supabase changes must continue to work as before

**Scope:**
All navigation and data fetching that does NOT involve tab inactivity followed by navigation should be completely unaffected by this fix. This includes:
- Same-page interactions (filtering, sorting, expanding cards)
- Navigation while tab is continuously active
- Direct URL access with valid session
- Server-side rendering and initial page loads

## Hypothesized Root Cause

Based on the bug description and codebase analysis, the most likely issues are:

1. **Session Token Expiration During Inactivity**: Supabase access tokens expire after a period of inactivity (default 1 hour). When the tab is inactive, the session token expires but is not automatically refreshed. When the user returns and navigates, the expired token causes authentication failures.

2. **No Visibility API Integration**: The application does not listen to the browser's `visibilitychange` event to detect when the tab becomes active again. Without this, there's no trigger to refresh the session when the user returns.

3. **Middleware Session Validation Hang**: The middleware's `await supabase.auth.getUser()` call may hang or timeout when the session token is expired, causing the navigation request to never complete. The middleware creates a new Supabase client on each request but doesn't handle expired sessions gracefully.

4. **Client-Side Session Staleness**: The `useCustomerDashboard` hook calls `supabase.auth.getSession()` which retrieves the cached session from local storage. If the session is expired, this call succeeds but returns stale data, and subsequent API calls fail silently or hang.

5. **No Automatic Session Refresh on Navigation**: Next.js App Router navigation is client-side and doesn't automatically trigger session refresh. The `getSupabaseBrowserClient` singleton is created once and reused, so it maintains the expired session state across navigations.

## Correctness Properties

Property 1: Bug Condition - Session Refresh on Tab Reactivation

_For any_ navigation event where the user navigates to a different dashboard page after the browser tab has been inactive and then becomes active again, the fixed application SHALL automatically refresh the Supabase session when the tab becomes visible, ensuring that subsequent navigation completes successfully and data loads within the expected time (1-3 seconds).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Normal Navigation Behavior

_For any_ navigation event where the bug condition does NOT hold (tab remains continuously active, or no navigation occurs after tab reactivation), the fixed application SHALL produce exactly the same behavior as the original application, preserving fast data loading, real-time updates, and all existing UI functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/lib/supabase/client.ts`

**Function**: `getSupabaseBrowserClient`

**Specific Changes**:
1. **Add Session Refresh Function**: Create a new exported function `refreshSupabaseSession()` that calls `supabase.auth.refreshSession()` to obtain a new access token using the refresh token.

2. **Add Visibility Change Listener**: Implement a browser visibility API listener that detects when the document becomes visible (`document.visibilityState === 'visible'`) and automatically calls `refreshSupabaseSession()`.

3. **Initialize Listener on Client Creation**: When the browser client singleton is created, set up the `visibilitychange` event listener to ensure session refresh happens automatically on tab reactivation.

4. **Handle Refresh Errors Gracefully**: If session refresh fails (e.g., refresh token also expired), redirect the user to the login page with a message indicating session expiration.

5. **Debounce Refresh Calls**: Implement debouncing to prevent multiple rapid refresh calls if the user switches tabs multiple times quickly.

**File 2**: `src/hooks/use-customer-dashboard.ts`

**Function**: `refresh` callback

**Specific Changes**:
1. **Add Session Validation**: Before fetching data, validate that the session is not expired by checking the `expires_at` timestamp. If expired, trigger a session refresh before proceeding with data fetching.

2. **Handle Session Refresh in Hook**: Import and call `refreshSupabaseSession()` from the client module if the session is detected as expired during the refresh operation.

3. **Improve Error Handling**: Add specific error handling for authentication errors (401, 403) that indicates session expiration, and trigger session refresh or redirect to login.

**File 3**: `src/middleware.ts`

**Function**: `middleware`

**Specific Changes**:
1. **Add Session Refresh Attempt**: Before calling `supabase.auth.getUser()`, attempt to refresh the session if the access token is expired. This ensures the middleware doesn't hang on expired tokens.

2. **Add Timeout to getUser Call**: Wrap the `supabase.auth.getUser()` call in a timeout (e.g., 5 seconds) to prevent indefinite hanging. If timeout occurs, redirect to login.

3. **Improve Error Logging**: Add detailed logging for session validation failures to help diagnose issues in production.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write automated tests that simulate tab inactivity by manipulating the browser's visibility state and Supabase session expiration. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Tab Inactive Navigation Test**: Simulate tab becoming hidden for 2 hours (force session expiration), then visible, then navigate to `/customer/orders` (will fail on unfixed code - infinite loading)
2. **Session Expiration Test**: Manually expire the Supabase session token, trigger navigation, observe middleware behavior (will hang or fail on unfixed code)
3. **Multiple Tab Switch Test**: Rapidly switch tabs multiple times, then navigate (may fail on unfixed code if session refresh is not debounced)
4. **Short Inactivity Test**: Simulate tab inactive for 5 minutes (session still valid), then navigate (should pass even on unfixed code - this is the edge case)

**Expected Counterexamples**:
- Navigation after tab inactivity results in infinite loading spinner
- Middleware `getUser()` call hangs or times out with expired session
- Console errors showing 401 Unauthorized or session expired messages
- Possible causes: expired session token, no session refresh on tab activation, middleware hanging on expired token

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL navigationEvent WHERE isBugCondition(navigationEvent) DO
  result := handleNavigation_fixed(navigationEvent)
  ASSERT result.dataLoaded = true
  ASSERT result.loadingTime <= 3000 // milliseconds
  ASSERT result.sessionRefreshed = true
END FOR
```

**Test Plan**: After implementing the fix, run the same test cases from exploratory checking and verify that:
- Session is automatically refreshed when tab becomes visible
- Navigation completes successfully within 1-3 seconds
- Data is fetched and displayed correctly
- No infinite loading states occur

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL navigationEvent WHERE NOT isBugCondition(navigationEvent) DO
  ASSERT handleNavigation_original(navigationEvent) = handleNavigation_fixed(navigationEvent)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different navigation paths, timing scenarios, session states)
- It catches edge cases that manual unit tests might miss (e.g., navigation during session refresh, rapid tab switching)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal navigation scenarios, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Active Tab Navigation Preservation**: Verify that navigating between dashboard pages while tab is continuously active continues to work with the same performance (fast loading, no delays)
2. **Hard Refresh Preservation**: Verify that Ctrl + Shift + R continues to reload pages correctly
3. **Initial Load Preservation**: Verify that initial page load after login continues to work without issues
4. **Real-time Updates Preservation**: Verify that Supabase real-time subscriptions continue to receive updates correctly
5. **Same-Page Interactions Preservation**: Verify that filtering, sorting, and other same-page interactions continue to work without triggering unnecessary session refreshes

### Unit Tests

- Test `refreshSupabaseSession()` function in isolation to verify it correctly calls Supabase refresh API
- Test visibility change listener registration and cleanup
- Test debouncing logic to ensure multiple rapid tab switches don't cause multiple refresh calls
- Test session expiration detection logic
- Test error handling for failed session refresh (expired refresh token)

### Property-Based Tests

- Generate random sequences of tab visibility changes (hidden/visible) and verify session state remains valid
- Generate random navigation paths through dashboard pages and verify all load correctly
- Generate random timing scenarios (short inactivity, long inactivity, rapid switching) and verify correct behavior
- Test that session refresh is idempotent (calling multiple times doesn't cause issues)

### Integration Tests

- Test full user flow: login → navigate to dashboard → switch tabs for 2 hours → return → navigate to orders page → verify data loads
- Test multiple dashboard pages (orders, bookings, payments, profile, tracking) after tab reactivation
- Test session refresh during active data fetching (ensure no race conditions)
- Test behavior when refresh token is also expired (should redirect to login)
- Test cross-browser compatibility (Chrome, Firefox, Safari, Edge) for visibility API
