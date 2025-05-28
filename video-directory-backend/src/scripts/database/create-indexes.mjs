#!/usr/bin/env node

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const mongoUri = process.env.DATABASE_URI || 'mongodb://127.0.0.1/video-directory-backend'

async function createIndexes() {
  console.log('🔄 Creating database indexes for optimal performance...')
  
  const client = new MongoClient(mongoUri)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db()
    
    // Videos collection indexes
    console.log('📋 Creating indexes for videos collection...')
    
    // Text search index for title and description
    await db.collection('videos').createIndex(
      { 
        title: 'text', 
        description: 'text',
        'tags.name': 'text',
        'categories.name': 'text'
      },
      { 
        name: 'video_text_search',
        weights: {
          title: 10,
          description: 5,
          'tags.name': 3,
          'categories.name': 2
        }
      }
    )
    console.log('  ✅ Text search index created')
    
    // Performance indexes
    await db.collection('videos').createIndex({ published: 1, createdAt: -1 }, { name: 'published_created' })
    await db.collection('videos').createIndex({ published: 1, views: -1 }, { name: 'published_popular' })
    await db.collection('videos').createIndex({ published: 1, publishedDate: -1 }, { name: 'published_date' })
    await db.collection('videos').createIndex({ slug: 1 }, { name: 'slug_unique', unique: true, sparse: true })
    await db.collection('videos').createIndex({ videoUrl: 1 }, { name: 'video_url_unique', unique: true })
    await db.collection('videos').createIndex({ isFeatured: 1, published: 1 }, { name: 'featured_published' })
    
    // Category and tag indexes
    await db.collection('videos').createIndex({ categories: 1, published: 1 }, { name: 'category_published' })
    await db.collection('videos').createIndex({ tags: 1, published: 1 }, { name: 'tags_published' })
    await db.collection('videos').createIndex({ skillLevel: 1, published: 1 }, { name: 'skill_published' })
    await db.collection('videos').createIndex({ duration: 1, published: 1 }, { name: 'duration_published' })
    
    console.log('  ✅ Performance indexes created')
    
    // Categories collection indexes
    console.log('📋 Creating indexes for categories collection...')
    await db.collection('categories').createIndex({ name: 1 }, { name: 'category_name_unique', unique: true })
    await db.collection('categories').createIndex({ slug: 1 }, { name: 'category_slug_unique', unique: true })
    console.log('  ✅ Category indexes created')
    
    // Tags collection indexes
    console.log('📋 Creating indexes for tags collection...')
    await db.collection('tags').createIndex({ name: 1 }, { name: 'tag_name_unique', unique: true })
    await db.collection('tags').createIndex({ slug: 1 }, { name: 'tag_slug_unique', unique: true })
    console.log('  ✅ Tag indexes created')
    
    // Creators collection indexes
    console.log('📋 Creating indexes for creators collection...')
    await db.collection('creators').createIndex({ name: 1 }, { name: 'creator_name' })
    await db.collection('creators').createIndex({ channelId: 1 }, { name: 'creator_channel_unique', unique: true, sparse: true })
    console.log('  ✅ Creator indexes created')
    
    // Users collection indexes
    console.log('📋 Creating indexes for users collection...')
    await db.collection('users').createIndex({ email: 1 }, { name: 'user_email_unique', unique: true })
    await db.collection('users').createIndex({ resetPasswordToken: 1 }, { name: 'reset_token', sparse: true })
    console.log('  ✅ User indexes created')
    
    // AutomationUsers collection indexes
    console.log('📋 Creating indexes for automation-users collection...')
    await db.collection('automation-users').createIndex({ email: 1 }, { name: 'automation_user_email_unique', unique: true })
    await db.collection('automation-users').createIndex({ apiKey: 1 }, { name: 'automation_api_key', sparse: true })
    await db.collection('automation-users').createIndex({ isActive: 1 }, { name: 'automation_active' })
    console.log('  ✅ Automation user indexes created')
    
    // Media collection indexes
    console.log('📋 Creating indexes for media collection...')
    await db.collection('media').createIndex({ filename: 1 }, { name: 'media_filename' })
    await db.collection('media').createIndex({ mimeType: 1 }, { name: 'media_type' })
    await db.collection('media').createIndex({ createdAt: -1 }, { name: 'media_created' })
    console.log('  ✅ Media indexes created')
    
    // Show all indexes
    console.log('\n📊 Index Summary:')
    const collections = ['videos', 'categories', 'tags', 'creators', 'users', 'automation-users', 'media']
    
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).listIndexes().toArray()
      console.log(`\n${collectionName} (${indexes.length} indexes):`)
      indexes.forEach(index => {
        const keys = Object.keys(index.key).map(key => `${key}: ${index.key[key]}`).join(', ')
        console.log(`  - ${index.name}: { ${keys} }`)
      })
    }
    
    console.log('\n✅ All database indexes created successfully!')
    console.log('🚀 Your database is now optimized for production performance')
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('📌 Database connection closed')
  }
}

// Run the script
createIndexes()
