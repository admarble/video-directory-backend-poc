import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Performance monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'code' in error) {
        // Skip MongoDB connection errors in development
        if (error.code === 'ECONNREFUSED' && process.env.NODE_ENV !== 'production') {
          return null
        }
      }
    }
    return event
  },
  
  // Add user context
  initialScope: {
    tags: {
      component: 'video-directory-backend',
    },
  },
})

export default Sentry
