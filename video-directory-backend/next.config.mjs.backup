import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false
}

export default withPayload(nextConfig, { 
  // Set to true to help with bundling issues
  devBundleServerPackages: true,
  // Add a custom path to your Payload config
  configPath: './src/payload.config.ts' 
})
