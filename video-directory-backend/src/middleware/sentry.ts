import { NextRequest, NextResponse } from 'next/server'

interface SentryScope {
  setTag: (key: string, value: string) => void
  setContext: (key: string, value: Record<string, unknown>) => void
}

interface SentryInterface {
  configureScope: (callback: (scope: SentryScope) => void) => void
  captureException: (error: unknown) => void
}

// Check if Sentry is available without importing it
function getSentry(): SentryInterface | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@sentry/nextjs') as SentryInterface
  } catch (_error) {
    return null
  }
}

export function sentryMiddleware(req: NextRequest, res: NextResponse) {
  // Set user context for Sentry only if available
  const Sentry = getSentry()
  if (Sentry) {
    Sentry.configureScope((scope: SentryScope) => {
      scope.setTag('path', req.nextUrl.pathname)
      scope.setContext('request', {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
      })
    })
  }

  return res
}

// Error boundary for API routes
export function withSentryErrorBoundary<T extends (...args: unknown[]) => unknown>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      const Sentry = getSentry()
      if (Sentry) {
        Sentry.captureException(error)
      } else {
        console.error('Error (Sentry not available):', error)
      }
      throw error
    }
  }) as T
}
