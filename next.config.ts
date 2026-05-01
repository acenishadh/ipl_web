import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught during development; don't block production builds.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Workaround for intermittent Windows locks on `.next/trace` during local builds.
    // IMPORTANT: do not apply this in production builds (e.g. Vercel), as it can
    // break Next.js server/app build artifacts (e.g. client reference manifests).
    const isWindows = process.platform === 'win32'
    const isProd = process.env.NODE_ENV === 'production'
    if (isServer && isWindows && !isProd) {
      config.plugins = (config.plugins ?? []).filter(
        (p: any) => p?.constructor?.name !== 'TraceEntryPointsPlugin'
      )
    }
    return config
  }
}

export default nextConfig

