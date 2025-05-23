import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  // Disable experimental features that might cause issues
  experimental: {
    turbopack: false,
    serverComponentsExternalPackages: ['sharp', 'mongodb']
  },
  // Add webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sharp', 'mongodb')
    }
    return config
  }
}

export default withPayload(nextConfig, { 
  // Enable dev bundling for better compatibility
  devBundleServerPackages: true,
  // Add a custom path to your Payload config
  configPath: './src/payload.config.ts' 
})
