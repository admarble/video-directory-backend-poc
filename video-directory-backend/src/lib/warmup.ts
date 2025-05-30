/**
 * Database connection pre-warmer
 * Initializes connections during server startup
 */

import { getPayload } from '@/getPayload'
import { redis } from '@/lib/redis'

export async function warmupConnections() {
  console.log('🔥 Warming up connections...')
  
  try {
    // Pre-warm Payload/MongoDB connection
    const payload = await getPayload()
    await payload.find({
      collection: 'users',
      limit: 1,
    })
    console.log('✅ MongoDB connection warmed')

    // Pre-warm Redis connection
    await redis.set('warmup', 'test', 10)
    await redis.get('warmup')
    console.log('✅ Redis connection warmed')

    console.log('🚀 All connections ready!')
  } catch (error) {
    console.error('⚠️ Connection warmup failed:', error instanceof Error ? error.message : String(error))
  }
}
