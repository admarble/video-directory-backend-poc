import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    // Allow authenticated users or automation users to create videos
    create: ({ req: { user } }) => {
      // Allow automation users with write permission
      if (user?.collection === 'automation-users') {
        return user?.isActive && (user?.permissions === 'video-readwrite' || user?.permissions === 'video-full')
      }
      // Allow regular authenticated users
      return !!user
    },
    // Allow public read access to published videos
    read: ({ req: { user } }) => {
      // Allow automation users with any permission
      if (user?.collection === 'automation-users') {
        return user?.isActive
      }
      // If regular user is authenticated, allow access to all videos
      if (user) return true
      // For public access, only show published videos
      return { published: { equals: true } }
    },
    // Allow authenticated users or automation users to update videos
    update: ({ req: { user } }) => {
      // Allow automation users with write permission
      if (user?.collection === 'automation-users') {
        return user?.isActive && (user?.permissions === 'video-readwrite' || user?.permissions === 'video-full')
      }
      // Allow regular authenticated users
      return !!user
    },
    // Only allow full permission automation users or regular users to delete
    delete: ({ req: { user } }) => {
      // Restrict automation users to full permission only for deletes
      if (user?.collection === 'automation-users') {
        return user?.isActive && user?.permissions === 'video-full'
      }
      // Allow regular authenticated users
      return !!user
    },
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
      required: false, // Made optional - will be populated by YouTube API
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
      required: false, // Made optional - will be populated by YouTube API
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
        beforeChange: [
          ({ value, siblingData }) => {
            // IMPORTANT: Use siblingData instead of data to avoid circular references
            // Only auto-generate if slug is empty and we have a title
            if (!value && siblingData?.title) {
              const slug = siblingData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '')
                .trim();
              
              return slug || `video-${Date.now()}`;
            }
            
            // Return existing value or generate fallback
            return value || `video-${Date.now()}`;
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