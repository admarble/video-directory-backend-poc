import { NextRequest, NextResponse } from 'next/server'
import redis, { RedisClient } from '@/lib/redis'

interface CacheOptions {
  ttl?: number
  tags?: string[]
  bypassCache?: boolean
}

export function withCache(options: CacheOptions = {}) {
  return function cacheMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function cachedHandler(req: NextRequest) {
      const { ttl = 3600, tags = [], bypassCache = false } = options
      
      // Skip caching for non-GET requests
      if (req.method !== 'GET' || bypassCache) {
        return handler(req)
      }

      // Generate cache key from URL and query params
      const url = new URL(req.url)
      const cacheKey = redis.key('api', 
        url.pathname.replace('/api/', ''),
        url.search || 'no-params'
      )

      try {
        // Try to get from cache first
        const cachedResponse = await redis.getJSON<{
          data: any
          headers: Record<string, string>
          status: number
        }>(cacheKey)

        if (cachedResponse) {
          // Return cached response
          return NextResponse.json(cachedResponse.data, {
            status: cachedResponse.status,
            headers: {
              ...cachedResponse.headers,
              'X-Cache': 'HIT',
              'Cache-Control': `public, max-age=${ttl}`,
            }
          })
        }

        // Execute handler
        const response = await handler(req)
        
        // Cache successful responses
        if (response.status >= 200 && response.status < 300) {
          const responseData = await response.json()
          
          await redis.setJSON(cacheKey, {
            data: responseData,
            headers: Object.fromEntries(response.headers.entries()),
            status: response.status,
          }, ttl)

          // Return response with cache headers
          return NextResponse.json(responseData, {
            status: response.status,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'X-Cache': 'MISS',
              'Cache-Control': `public, max-age=${ttl}`,
            }
          })
        }

        return response

      } catch (error) {
        console.error('Cache middleware error:', error)
        // Fallback to handler if caching fails
        return handler(req)
      }
    }
  }
}

// Cache invalidation helper
export async function invalidateCache(pattern: string) {
  try {
    // This is a simplified version - in production you'd want to use Redis SCAN
    const cacheKey = redis.key(pattern)
    await redis.del(cacheKey)
    console.log(`Cache invalidated: ${cacheKey}`)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Bulk cache invalidation
export async function invalidateCacheTags(tags: string[]) {
  for (const tag of tags) {
    await invalidateCache(tag)
  }
}
