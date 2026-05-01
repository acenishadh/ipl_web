import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught during development; don't block production builds.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Workaround for intermittent Windows locks on `.next/trace`.
      // Disabling the tracing plugin keeps local builds reliable.
      config.plugins = (config.plugins ?? []).filter((p: any) => p?.constructor?.name !== 'TraceEntryPointsPlugin')
    }
    return config
  }
}

export default nextConfig

