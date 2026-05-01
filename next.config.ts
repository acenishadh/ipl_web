import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught during development; don't block production builds.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Work around Windows/AV locks on `.next/trace` by using a different dist dir.
  // (Also avoids partial `.next` deletions causing ENOENT on dev requests.)
  distDir: '.next-web',
  // Avoid writing `.next*/trace` on Windows where it may be locked.
  // This is safe for local dev; deployment can re-enable if needed.
  outputFileTracing: false,
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'),
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

