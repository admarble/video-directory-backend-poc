import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      label: 'Tag Type',
      options: [
        { label: 'General Tag', value: 'general' },
        { label: 'Tool/Technology', value: 'tool' },
      ],
      defaultValue: 'general',
      admin: {
        description: 'Categorize this tag as a general tag or a tool/technology',
      },
    },
  ],
  timestamps: true,
} 