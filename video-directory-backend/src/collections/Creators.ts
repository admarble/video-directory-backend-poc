import type { CollectionConfig } from 'payload'
import { creatorAnalyticsHook, trackContentDeletedHook } from '@/hooks/admin-analytics-hooks'

export const Creators: CollectionConfig = {
  slug: 'creators',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    afterChange: [creatorAnalyticsHook],
    afterDelete: [trackContentDeletedHook],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
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
      name: 'email',
      type: 'email',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'youtubeChannel',
      type: 'text',
      label: 'YouTube Channel URL',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
        },
        {
          name: 'github',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Website', value: 'website' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
