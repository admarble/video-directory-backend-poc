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
    // Only add essential optimizations in non-Turbopack mode
    if (!process.env.TURBOPACK && !isServer && !dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/](date-fns|lodash|react|react-dom)[\\/]/,
            chunks: 'all',
            name: 'vendor',
            priority: 10,
          },
        },
      }
    }
    
    return config
  },
  
  // Use Next.js 15.3.0 built-in optimizations
  experimental: {
    optimizePackageImports: ['date-fns', 'lodash'],
  },
  
  // Turbopack configuration (stable in Next.js 15.3.0)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveExtensions: [
      '.mdx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  },
}

export default withPayload(nextConfig, {
  configPath: './src/payload.config.ts',
})
