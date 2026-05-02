import type { NextConfig } from 'next'

const isWindows = process.platform === 'win32'
const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Avoid writing under a locked `.next/` on Windows (EPERM on trace / package.json).
  // Production builds still use `.next` unless NEXT_DIST_DIR is set.
  distDir: process.env.NEXT_DIST_DIR
    ? process.env.NEXT_DIST_DIR
    : isWindows && !isProd
      ? '.next-dev'
      : '.next',
  typescript: {
    // Type errors are caught during development; don't block production builds.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    // Workaround for intermittent Windows locks on `.next/trace` during local dev.
    // Apply on both client + server bundles (trace plugin can appear on either).
    // IMPORTANT: do not apply in production builds (e.g. Vercel) — breaks app artifacts.
    if (isWindows && !isProd) {
      config.plugins = (config.plugins ?? []).filter(
        (p: any) => p?.constructor?.name !== 'TraceEntryPointsPlugin'
      )
    }
    return config
  }
}

export default nextConfig

