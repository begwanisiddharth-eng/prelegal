import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) — no canvas alias needed for react-pdf at runtime
  // since the PDF viewer only runs client-side via dynamic import with ssr:false
  turbopack: {},
}

export default nextConfig
