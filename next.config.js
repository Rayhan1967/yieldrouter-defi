
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // For static export (optional)
  output: 'export',
  trailingSlash: true,
  distDir: 'out'
}

module.exports = nextConfig