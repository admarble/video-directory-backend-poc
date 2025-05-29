// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Users } from './collections/Users'
import { AutomationUsers } from './collections/AutomationUsers'
import { Media } from './collections/Media'
import { Videos } from './collections/Videos'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Creators } from './collections/Creators'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  cors: [
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'http://127.0.0.1:4322',
    'http://127.0.0.1:3000',
  ],
  csrf: [
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'http://127.0.0.1:4322',
    'http://127.0.0.1:3000',
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Performance optimizations for admin panel
    buildPath: path.resolve(dirname, '../.next/admin'),
    meta: {
      titleSuffix: '- Video Directory',
      favicon: '/favicon.ico',
    },
    // Optimize admin panel loading
    dateFormat: 'MM/dd/yyyy',
    livePreview: {
      collections: ['videos'], // Limit live preview to essential collections
    },
  },
  collections: [Users, AutomationUsers, Media, Videos, Categories, Tags, Creators],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    // Database performance optimizations
    connectOptions: {
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  }),
  sharp,
  
  // Performance optimizations
  rateLimit: {
    max: 500,
    window: 15 * 60 * 1000, // 15 minutes
    skip: (req) => {
      // Skip rate limiting for admin panel in development
      return process.env.NODE_ENV === 'development' && 
             req.headers['user-agent']?.includes('Mozilla')
    },
  },
  
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'noreply@videodirectory.example.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Video Directory',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: process.env.SMTP_SECURE === 'true',
    },
    skipVerify: process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST || process.env.SMTP_HOST.includes('example.com'),
  }),
})
