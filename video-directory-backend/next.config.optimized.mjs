import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential Next.js config
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  
  // Simplified webpack configuration for better performance
  webpack: (config, { isServer, dev }) => {
    // Only add essential optimizations
    if (!isServer && !dev) {
      // Production client-side optimizations only
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Simple vendor chunk for large libraries
          vendor: {
            test: /[\\/]node_modules[\\/](date-fns|lodash|react|react-dom)[\\/]/,
            chunks: 'all',
            name: 'vendor',
            priority: 10,
          },
        },
      }
    }
    
    // Let Next.js and PayloadCMS handle module resolution naturally
    return config
  },
  
  // Use Next.js 15.3.0 built-in optimizations
  experimental: {
    // Let Next.js optimize packages automatically
    optimizePackageImports: ['date-fns', 'lodash'],
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default withPayload(nextConfig, {
  // Let PayloadCMS handle its own bundling optimizations
  configPath: './src/payload.config.ts',
})
