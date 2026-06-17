import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export to frontend/out, served by FastAPI in production.
  output: 'export',
  // Emit per-route directories (login/index.html) so static serving resolves
  // routes without a server.
  trailingSlash: true,
  // Turbopack (default in Next.js 16) — no canvas alias needed for react-pdf at runtime
  // since the PDF viewer only runs client-side via dynamic import with ssr:false
  turbopack: {},
}

export default nextConfig
