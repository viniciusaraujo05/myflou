/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@flou/shared'],
}

module.exports = nextConfig
