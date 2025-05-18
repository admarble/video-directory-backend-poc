import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  turbopack: {}
}

export default withPayload(nextConfig, { 
  devBundleServerPackages: false,
  // Add a custom path to your Payload config
  configPath: './src/payload.config.ts' 
})
