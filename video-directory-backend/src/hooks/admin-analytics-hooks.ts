import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeLoginHook,
} from 'payload'

// Server-side admin tracking function
function trackAdminServerEvent(event: string, properties: Record<string, unknown>, userId?: string) {
  // Log to server console for now - can be enhanced with server-side PostHog
  console.log('Admin Server Event:', {
    event,
    properties: {
      ...properties,
      interface_type: 'admin',
      timestamp: new Date().toISOString(),
      user_id: userId,
    },
  })

  // TODO: Implement server-side PostHog tracking if needed
  // This could use posthog-node for server-side events
}

// Admin event constants
const AdminEvents = {
  VIDEO_CREATED: 'admin_video_created',
  VIDEO_UPDATED: 'admin_video_updated',
  VIDEO_DELETED: 'admin_video_deleted',
  VIDEO_PUBLISHED: 'admin_video_published',

  CATEGORY_CREATED: 'admin_category_created',
  CATEGORY_UPDATED: 'admin_category_updated',
  CATEGORY_DELETED: 'admin_category_deleted',

  TAG_CREATED: 'admin_tag_created',
  TAG_UPDATED: 'admin_tag_updated',
  TAG_DELETED: 'admin_tag_deleted',

  CREATOR_CREATED: 'admin_creator_created',
  CREATOR_UPDATED: 'admin_creator_updated',
  CREATOR_DELETED: 'admin_creator_deleted',

  USER_LOGIN: 'admin_user_login',
  USER_LOGOUT: 'admin_user_logout',
  USER_CREATED: 'admin_user_created',
  USER_UPDATED: 'admin_user_updated',
  USER_DELETED: 'admin_user_deleted',

  MEDIA_UPLOADED: 'admin_media_uploaded',
  MEDIA_DELETED: 'admin_media_deleted',

  BULK_ACTION: 'admin_bulk_action',
  EXPORT_DATA: 'admin_export_data',
  IMPORT_DATA: 'admin_import_data',
} as const

// Hook to track content creation
export const trackContentCreatedHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  // Only track creation operations
  if (operation === 'create') {
    const userId = req.user?.id
    const contentType = collection?.slug || 'unknown'

    trackAdminServerEvent(
      AdminEvents.VIDEO_CREATED,
      {
        content_type: contentType,
        content_id: doc.id,
        content_title: doc.title || doc.name || 'Untitled',
        user_id: userId,
        operation: 'create',
      },
      userId,
    )
  }

  // Track updates
  if (operation === 'update') {
    const userId = req.user?.id
    const contentType = collection?.slug || 'unknown'

    trackAdminServerEvent(
      AdminEvents.VIDEO_UPDATED,
      {
        content_type: contentType,
        content_id: doc.id,
        content_title: doc.title || doc.name || 'Untitled',
        user_id: userId,
        operation: 'update',
      },
      userId,
    )
  }

  return doc
}

// Hook to track content deletion
export const trackContentDeletedHook: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  const userId = req.user?.id
  const contentType = collection?.slug || 'unknown'

  trackAdminServerEvent(
    AdminEvents.VIDEO_DELETED,
    {
      content_type: contentType,
      content_id: doc.id,
      content_title: doc.title || doc.name || 'Untitled',
      user_id: userId,
      operation: 'delete',
    },
    userId,
  )

  return doc
}

// Hook to track user login
export const trackUserLoginHook: CollectionBeforeLoginHook = async ({ req, user }) => {
  if (user) {
    trackAdminServerEvent(
      AdminEvents.USER_LOGIN,
      {
        user_id: user.id,
        user_email: user.email,
        login_time: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      },
      user.id,
    )
  }

  return user
}

// Video-specific hooks
export const videoAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.VIDEO_CREATED,
      {
        video_id: doc.id,
        video_title: doc.title,
        video_category: doc.category?.title || doc.category,
        video_creator: doc.creator?.name || doc.creator,
        published: doc.published || false,
        youtube_url: doc.youtubeUrl,
        user_id: userId,
      },
      userId,
    )
  }

  if (operation === 'update') {
    trackAdminServerEvent(
      AdminEvents.VIDEO_UPDATED,
      {
        video_id: doc.id,
        video_title: doc.title,
        video_category: doc.category?.title || doc.category,
        published: doc.published || false,
        user_id: userId,
      },
      userId,
    )

    // Track if video was published
    if (doc.published && operation === 'update') {
      trackAdminServerEvent(
        AdminEvents.VIDEO_PUBLISHED,
        {
          video_id: doc.id,
          video_title: doc.title,
          video_category: doc.category?.title || doc.category,
          user_id: userId,
        },
        userId,
      )
    }
  }

  return doc
}

// Category-specific hooks
export const categoryAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.CATEGORY_CREATED,
      {
        category_id: doc.id,
        category_title: doc.title,
        category_slug: doc.slug,
        user_id: userId,
      },
      userId,
    )
  }

  if (operation === 'update') {
    trackAdminServerEvent(
      AdminEvents.CATEGORY_UPDATED,
      {
        category_id: doc.id,
        category_title: doc.title,
        category_slug: doc.slug,
        user_id: userId,
      },
      userId,
    )
  }

  return doc
}

// Tag-specific hooks
export const tagAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.TAG_CREATED,
      {
        tag_id: doc.id,
        tag_title: doc.title,
        tag_slug: doc.slug,
        user_id: userId,
      },
      userId,
    )
  }

  if (operation === 'update') {
    trackAdminServerEvent(
      AdminEvents.TAG_UPDATED,
      {
        tag_id: doc.id,
        tag_title: doc.title,
        tag_slug: doc.slug,
        user_id: userId,
      },
      userId,
    )
  }

  return doc
}

// Creator-specific hooks
export const creatorAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.CREATOR_CREATED,
      {
        creator_id: doc.id,
        creator_name: doc.name,
        creator_slug: doc.slug,
        youtube_channel: doc.youtubeChannel,
        user_id: userId,
      },
      userId,
    )
  }

  if (operation === 'update') {
    trackAdminServerEvent(
      AdminEvents.CREATOR_UPDATED,
      {
        creator_id: doc.id,
        creator_name: doc.name,
        creator_slug: doc.slug,
        youtube_channel: doc.youtubeChannel,
        user_id: userId,
      },
      userId,
    )
  }

  return doc
}

// Media upload tracking
export const mediaAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.MEDIA_UPLOADED,
      {
        media_id: doc.id,
        media_filename: doc.filename,
        media_mimetype: doc.mimeType,
        media_filesize: doc.filesize,
        media_alt: doc.alt,
        user_id: userId,
      },
      userId,
    )
  }

  return doc
}

// User management tracking
export const userAnalyticsHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  const userId = req.user?.id

  if (operation === 'create') {
    trackAdminServerEvent(
      AdminEvents.USER_CREATED,
      {
        new_user_id: doc.id,
        new_user_email: doc.email,
        new_user_role: doc.role,
        created_by: userId,
      },
      userId,
    )
  }

  if (operation === 'update') {
    trackAdminServerEvent(
      AdminEvents.USER_UPDATED,
      {
        updated_user_id: doc.id,
        updated_user_email: doc.email,
        updated_user_role: doc.role,
        updated_by: userId,
      },
      userId,
    )
  }

  return doc
}
