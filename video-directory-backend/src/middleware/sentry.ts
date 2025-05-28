import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export function sentryMiddleware(req: NextRequest, res: NextResponse) {
  // Set user context for Sentry
  Sentry.configureScope((scope) => {
    scope.setTag('path', req.nextUrl.pathname)
    scope.setContext('request', {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    })
  })

  return res
}

// Error boundary for API routes
export function withSentryErrorBoundary<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  }) as T
}
