import type { CollectionConfig } from 'payload'
import { mediaAnalyticsHook } from '@/hooks/admin-analytics-hooks'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
  },
  hooks: {
    afterChange: [mediaAnalyticsHook],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
