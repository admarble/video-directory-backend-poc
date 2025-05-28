import type { CollectionConfig } from 'payload'

export const AutomationUsers: CollectionConfig = {
  slug: 'automation-users',
  auth: {
    useAPIKey: true, // This enables API key generation
    disableLocalStrategy: true, // Disable email/password login
  },
  access: {
    // Allow admin panel users to manage automation users
    create: ({ req: { user } }) => {
      // Allow any authenticated user from the 'users' collection (admin panel users)
      return user?.collection === 'users'
    },
    read: ({ req: { user } }) => {
      // Allow any authenticated user from the 'users' collection (admin panel users)
      // OR allow automation-users to read their own collection for validation
      return user?.collection === 'users' || user?.collection === 'automation-users'
    },
    update: ({ req: { user } }) => {
      // Allow any authenticated user from the 'users' collection (admin panel users)
      return user?.collection === 'users'
    },
    delete: ({ req: { user } }) => {
      // Allow any authenticated user from the 'users' collection (admin panel users)
      return user?.collection === 'users'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Descriptive name for this automation user (e.g., "n8n Video Agent")',
      },
    },
    {
      name: 'purpose',
      type: 'text',
      admin: {
        description: 'What this automation user is for (e.g., "AI agent for video content curation")',
      },
    },
    {
      name: 'permissions',
      type: 'select',
      options: [
        { label: 'Video Read Only', value: 'video-read' },
        { label: 'Video Read/Write', value: 'video-readwrite' },
        { label: 'Video Management (Full)', value: 'video-full' },
      ],
      defaultValue: 'video-readwrite',
      admin: {
        description: 'Define what this automation user can do with videos',
      },
    },
    {
      name: 'rateLimitTier',
      type: 'select',
      options: [
        { label: 'Standard (100 req/15min)', value: 'standard' },
        { label: 'High (500 req/15min)', value: 'high' },
        { label: 'Unlimited', value: 'unlimited' },
      ],
      defaultValue: 'standard',
      admin: {
        description: 'Rate limiting tier for API requests',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this automation user can currently make API requests',
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last time this automation user made an API request',
      },
    },
  ],
  timestamps: true,
}
