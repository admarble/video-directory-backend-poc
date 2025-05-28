#!/usr/bin/env node

import { getPayloadClient } from '../getPayload.js'
import config from '../payload.config.js' 
import redis from '../lib/redis.js'

async function warmCache() {
  console.log('🔥 Warming cache with popular content...')
  
  const payload = await getPayloadClient()
  
  try {
    // Warm popular videos cache
    console.log('📹 Caching popular videos...')
    const popularVideos = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 50,
      sort: '-views',
      depth: 2,
    })
    
    await redis.setJSON(redis.key('api', 'videos', 'popular'), popularVideos, 7200)
    
    // Warm categories cache
    console.log('📂 Caching categories...')
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })
    
    await redis.setJSON(redis.key('api', 'categories'), categories, 14400)
    
    // Warm analytics cache
    console.log('📊 Caching analytics...')
    const totalVideos = await payload.count({
      collection: 'videos',
      where: { published: { equals: true } }
    })
    
    await redis.setJSON(redis.key('analytics'), { totalVideos }, 3600)
    
    console.log('✅ Cache warming completed successfully!')
    
  } catch (error) {
    console.error('❌ Cache warming failed:', error)
  }
}

warmCache()
