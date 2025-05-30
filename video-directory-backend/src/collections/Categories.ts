import type { CollectionConfig } from 'payload'
import { categoryAnalyticsHook, trackContentDeletedHook } from '@/hooks/admin-analytics-hooks'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [categoryAnalyticsHook],
    afterDelete: [trackContentDeletedHook],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    // Self-referencing parent field removed to prevent circular references
    // Can be added back in future version with proper depth controls
  ],
  timestamps: true,
}
