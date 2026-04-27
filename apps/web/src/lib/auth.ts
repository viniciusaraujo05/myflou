export const ACCESS_TOKEN_COOKIE  = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

/**
 * Client-side fetch wrapper.
 * - On 401: tries to refresh the session once, retries the request.
 * - If refresh also fails: redirects to /login.
 * Use this for all client-side API calls so sessions are recovered silently.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init)

  if (res.status !== 401) return res

  // Token expired — try a silent refresh via the BFF
  try {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
    if (refreshRes.ok) {
      // Retry original request with fresh cookies (browser sends them automatically)
      return fetch(input, init)
    }
  } catch {
    // Network error during refresh — fall through to login redirect
  }

  // Session is gone — redirect to login
  if (typeof window !== 'undefined') {
    window.location.replace('/login')
  }
  return res
}
