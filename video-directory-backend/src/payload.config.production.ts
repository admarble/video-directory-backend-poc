// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
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
    'http://localhost:4321', // Frontend Astro server
    'http://localhost:4322', // Alternative frontend port
    'http://localhost:3000', // Alternative frontend port
    'http://127.0.0.1:4321',
    'http://127.0.0.1:4322',
    'http://127.0.0.1:3000',
    ...(process.env.CORS_ORIGIN?.split(',') || []), // Production CORS origins
  ],
  csrf: [
    'http://localhost:4321',
    'http://localhost:4322', 
    'http://localhost:3000',
    'http://127.0.0.1:4321',
    'http://127.0.0.1:4322',
    'http://127.0.0.1:3000',
    ...(process.env.CORS_ORIGIN?.split(',') || []),
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Video Directory Admin',
      favicon: '/media/favicon.ico',
      ogImage: '/media/admin-og.jpg',
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
    // Production MongoDB options
    mongoOptions: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    seoPlugin({
      collections: ['videos'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title} - Video Tutorial Directory`,
      generateDescription: ({ doc }) => doc?.description || 'Learn with our comprehensive video tutorials',
      generateURL: ({ doc, locale }) => `${process.env.SITE_URL}/tutorials/${doc?.slug}`,
      generateImage: ({ doc }) => doc?.thumbnail?.url || `${process.env.SITE_URL}/media/default-tutorial-image.jpg`,
      // Add structured data for video tutorials
      generateSchema: ({ doc }) => ({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: doc?.title,
        description: doc?.description,
        thumbnailUrl: doc?.thumbnail?.url,
        uploadDate: doc?.publishedDate || doc?.createdAt,
        duration: `PT${doc?.duration}S`,
        contentUrl: doc?.videoUrl,
        embedUrl: doc?.videoUrl?.replace('watch?v=', 'embed/'),
        author: {
          '@type': 'Person',
          name: doc?.creator?.name || 'Unknown Creator',
        },
        genre: doc?.categories?.map(cat => cat.name).join(', '),
        keywords: doc?.tags?.map(tag => tag.name).join(', '),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.5,
          reviewCount: Math.max(1, doc?.views || 1),
        },
      }),
    }),
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
  // Production optimizations
  rateLimit: {
    trustProxy: true,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    window: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    skip: (req) => {
      // Skip rate limiting for automation users
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        // You can add logic here to verify automation user tokens
        return false; // For now, apply rate limiting to all requests
      }
      return false;
    },
  },
  // Enable compression
  compression: {
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6,
    chunkSize: 16384,
  },
  // Logging configuration
  loggerOptions: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  },
})
