import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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
  ],
  csrf: [
    'http://localhost:4321',
    'http://localhost:4322', 
    'http://localhost:3000',
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Add custom admin components
    components: {
      views: {
        dashboard: {
          Component: './components/admin/AdminDashboard#AdminDashboard',
        },
        analytics: {
          Component: './components/admin/AnalyticsDashboard#AnalyticsDashboard',
          path: '/analytics',
        },
      },
    },
    meta: {
      titleSuffix: '- Video Directory',
    },
    // Disable live preview in development for faster loading
    livePreview: {
      url: () => '',
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
  }),
  sharp,
  plugins: [],
})
