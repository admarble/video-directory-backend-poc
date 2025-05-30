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

// Optimized development configuration
export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  cors: ['http://localhost:4321', 'http://localhost:3000'],
  csrf: ['http://localhost:4321', 'http://localhost:3000'],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Disable features that slow down development
    livePreview: {
      url: () => '', // Disable by providing empty URL
    },
    // Disable admin panel features in development for faster loading
    dateFormat: 'yyyy-MM-dd',
    // Reduce initial bundle size
    components: {
      // Remove graphics components to reduce bundle size
      graphics: {
        Logo: undefined,
        Icon: undefined,
      },
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
  // Disable plugins in development that aren't needed
  plugins: process.env.NODE_ENV === 'production' ? [
    // Only load plugins in production
  ] : [],
  // Skip email configuration in development
  email: undefined,
  // Disable telemetry for faster startup
  telemetry: false,
})
