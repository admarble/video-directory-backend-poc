import { withPayload } from '@payloadcms/next/withPayload'

const isDev = process.env.NODE_ENV === 'development'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential Next.js config
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  
  // Optimize for development
  reactStrictMode: !isDev, // Disable in dev to prevent double renders
  
  // Minimal webpack config for better performance
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      // Development optimizations
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      }
      // Disable source maps in development for faster builds
      config.devtool = false
    }
    
    return config
  },
  
  // Enable modularizeImports for all heavy dependencies
  modularizeImports: {
    '@payloadcms/ui': {
      transform: '@payloadcms/ui/{{member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Use experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@payloadcms/ui',
      '@payloadcms/richtext-lexical',
      'date-fns',
      'lodash',
      'react-dom',
      'react',
    ],
    // Enable React compiler for faster JSX transforms
    reactCompiler: isDev,
    // Use swc minifier in development too
    swcMinify: true,
    // Optimize server components
    serverComponentsExternalPackages: ['mongoose', 'sharp'],
  },
  
  // Turbopack configuration for blazing fast dev builds
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      // Add aliases for faster resolution
      '@': './src',
      '@payload-config': './src/payload.config.ts',
    },
  },
}

// Use development config if available and in development
const configPath = isDev && process.env.USE_DEV_CONFIG === 'true' 
  ? './src/payload.config.development.ts' 
  : './src/payload.config.ts'

export default withPayload(nextConfig, {
  configPath,
})
