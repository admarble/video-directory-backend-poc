import type { CollectionConfig } from 'payload'
import { tagAnalyticsHook, trackContentDeletedHook } from '@/hooks/admin-analytics-hooks'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [tagAnalyticsHook],
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
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for tag display (e.g., #FF5733)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
