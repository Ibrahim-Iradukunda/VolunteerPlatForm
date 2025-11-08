/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude better-sqlite3 and Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
  // Turbopack configuration (Next.js 16+)
  // Empty config silences the warning - better-sqlite3 is only used in API routes (server-side)
  turbopack: {},
}

export default nextConfig
