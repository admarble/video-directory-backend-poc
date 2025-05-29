import { withPayload } from '@payloadcms/next/withPayload'
import { createRequire } from 'module'
import path from 'path'
const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  
  // Enhanced webpack configuration for vendor chunk handling and PayloadCMS fixes
  webpack: (config, { isServer, webpack }) => {
    // More aggressive approach to handle date-fns locale resolution issues
    // Create a custom resolver for all date-fns locale imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^date-fns\/locale\/.*$/,
        (resource) => {
          // Default to en-US for any locale request
          resource.request = require.resolve('date-fns/locale/en-US')
        }
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^date-fns\/esm\/locale\/.*$/,
        (resource) => {
          // Default to en-US for any ESM locale request
          resource.request = require.resolve('date-fns/locale/en-US')
        }
      )
    )
    
    // Handle date-fns version conflicts and locale resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'date-fns': require.resolve('date-fns'),
      // Comprehensive aliases for all possible date-fns locale import patterns
      'date-fns/locale/en-US': require.resolve('date-fns/locale/en-US'),
      'date-fns/locale/en': require.resolve('date-fns/locale/en-US'),
      'date-fns/esm/locale/en-US': require.resolve('date-fns/locale/en-US'),
      'date-fns/esm/locale/en': require.resolve('date-fns/locale/en-US'),
      'date-fns/locale': require.resolve('date-fns/locale/en-US'),
      'date-fns/esm/locale': require.resolve('date-fns/locale/en-US'),
    }
    
    // Add comprehensive fallback resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'date-fns/locale/en-US': require.resolve('date-fns/locale/en-US'),
      'date-fns/esm/locale/en-US': require.resolve('date-fns/locale/en-US'),
    }
    
    // Ensure proper module resolution for date-fns
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      'node_modules',
      path.resolve('./node_modules'),
      path.resolve('./node_modules/date-fns'),
    ]
    
    // Add extensions to help resolve modules
    config.resolve.extensions = [
      ...config.resolve.extensions,
      '.mjs',
      '.js', 
      '.json'
    ]
    
    if (!isServer) {
      // Optimize client-side chunking for date-fns
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          'date-fns': {
            name: 'date-fns',
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }
    
    // Ensure proper ESM handling
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    })

    return config
  },
  
  // Experimental features for better compatibility
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['date-fns'],
  },
}

export default withPayload(nextConfig, { 
  // Set to true to help with bundling issues
  devBundleServerPackages: true,
  // Add a custom path to your Payload config
  configPath: './src/payload.config.ts' 
})
