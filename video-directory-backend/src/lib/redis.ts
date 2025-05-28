import Redis from 'ioredis'

class RedisClient {
  private client: Redis | null = null
  private isConnected = false

  constructor() {
    if (process.env.REDIS_URL) {
      this.connect()
    }
  }

  private connect() {
    try {
      this.client = new Redis(process.env.REDIS_URL!, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
        this.isConnected = false
      })

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) return null
    
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<boolean> {
    if (!this.client || !this.isConnected) return false
    
    try {
      await this.client.setex(key, ttlSeconds, value)
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) return false
    
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async flush(): Promise<boolean> {
    if (!this.client || !this.isConnected) return false
    
    try {
      await this.client.flushall()
      return true
    } catch (error) {
      console.error('Redis FLUSH error:', error)
      return false
    }
  }

  // Cache with automatic JSON serialization
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key)
    if (!value) return null
    
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  async setJSON<T>(key: string, value: T, ttlSeconds = 3600): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value), ttlSeconds)
    } catch {
      return false
    }
  }

  // Increment counter with expiration
  async increment(key: string, ttlSeconds = 3600): Promise<number> {
    if (!this.client || !this.isConnected) return 0
    
    try {
      const count = await this.client.incr(key)
      if (count === 1) {
        await this.client.expire(key, ttlSeconds)
      }
      return count
    } catch (error) {
      console.error('Redis INCREMENT error:', error)
      return 0
    }
  }

  // Generate cache key with namespace
  static key(...parts: string[]): string {
    return `video-directory:${parts.join(':')}`
  }
}

export const redis = new RedisClient()
export default redis
