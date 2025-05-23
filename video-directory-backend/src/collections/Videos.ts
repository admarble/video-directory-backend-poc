import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    // Allow authenticated users to create videos
    create: ({ req: { user } }) => !!user,
    // Allow public read access to published videos
    read: ({ req: { user }, data }) => {
      // If user is authenticated, allow access to all videos
      if (user) return true
      // For public access, only show published videos
      return { published: { equals: true } }
    },
    // Only authenticated users can update videos
    update: ({ req: { user } }) => !!user,
    // Only authenticated users can delete videos
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'YouTube Video URL',
    },
    {
      name: 'youtubeDataFetcher',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: 'src/fields/YouTubeField',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (seconds)',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'creator',
      type: 'relationship',
      relationTo: 'creators',
      required: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      admin: {
        description: 'SEO-friendly URL slug (auto-generated from title if empty)',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (!data?.slug && data?.title) {
              // Auto-generate slug from title
              data.slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            }
            return data
          },
        ],
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Featured Tutorial',
      defaultValue: false,
      admin: {
        description: 'Mark as featured to show on homepage hero section',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'View Count',
      defaultValue: 0,
      admin: {
        description: 'Number of times this tutorial has been viewed',
      },
    },
    {
      name: 'skillLevel',
      type: 'select',
      label: 'Skill Level',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
    },
  ],
  timestamps: true,
}