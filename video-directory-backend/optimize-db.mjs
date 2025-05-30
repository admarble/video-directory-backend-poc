#!/usr/bin/env node

/**
 * MongoDB Performance Optimization Script
 * Creates indexes for faster admin panel queries
 */

import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/video-directory-backend'

async function optimizeDatabase() {
  console.log('🔧 Optimizing database for admin panel performance...')
  
  const client = new MongoClient(DATABASE_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Create indexes for common admin queries
    console.log('Creating indexes...')
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 })
    await db.collection('users').createIndex({ role: 1 })
    
    // Videos collection indexes
    await db.collection('videos').createIndex({ title: 1 })
    await db.collection('videos').createIndex({ published: 1 })
    await db.collection('videos').createIndex({ createdAt: -1 })
    await db.collection('videos').createIndex({ updatedAt: -1 })
    await db.collection('videos').createIndex({ skillLevel: 1 })
    
    // Categories collection indexes
    await db.collection('categories').createIndex({ name: 1 })
    
    // Tags collection indexes  
    await db.collection('tags').createIndex({ name: 1 })
    
    // Creators collection indexes
    await db.collection('creators').createIndex({ name: 1 })
    
    console.log('✅ Database optimization complete!')
    console.log('📊 Admin panel queries should be much faster now.')
    
  } catch (error) {
    console.error('❌ Error optimizing database:', error.message)
  } finally {
    await client.close()
  }
}

// Run the optimization
optimizeDatabase()
