/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@flou/shared'],

  async headers() {
    const isDev = process.env.NODE_ENV === 'development'

    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' — Next.js inlines hydration scripts
      // 'unsafe-eval'   — required for Railway's CSP and any eval-using lib (e.g. xlsx)
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      // API lives on the same origin (/api/*) in the BFF pattern
      "connect-src 'self' https://accounts.google.com",
      // Google OAuth redirect flow — no iframes needed
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',   value: csp },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
