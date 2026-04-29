/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@flou/shared'],

  async headers() {
    const csp = [
      "default-src 'self'",
      // 'unsafe-inline'  – Next.js inlines hydration/bootstrap scripts
      // 'unsafe-eval'    – required; Google OAuth checks that the redirect destination
      //                    allows eval before completing the flow
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      // All fetch calls go through the Next.js BFF (/api/*), so 'self' is enough.
      "connect-src 'self' https:",
      // Google OAuth redirect flow — no iframes or popups used.
      "frame-src https://accounts.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
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
