import type { NextConfig } from 'next'

// Swappy is fully client-side, so it ships as a static export.
// On GitHub Pages the site lives under /Swappy, set via PAGES_BASE_PATH in CI.
const basePath = process.env.PAGES_BASE_PATH || ''

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
