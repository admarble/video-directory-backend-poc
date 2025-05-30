import { getPayload } from 'payload'
import config from '../payload.config.js'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

/**
 * Seed script for core categories for indie hackers and developers
 * Run with: npm run seed-categories
 */

const CORE_CATEGORIES = [
  {
    title: 'Business Strategy',
    slug: 'business-strategy',
    description: 'Learn about idea validation, business models, pricing strategies, and revenue optimization. Perfect for indie hackers starting their entrepreneurial journey.',
  },
  {
    title: 'AI & Automation',
    slug: 'ai-automation',
    description: 'Discover AI coding tools like Cursor and Copilot, workflow automation, and AI-powered business tools to boost your productivity.',
  },
  {
    title: 'No-Code/Low-Code',
    slug: 'no-code-low-code',
    description: 'Master tools like Supabase, Vercel, Webflow, and Zapier to build powerful applications without extensive coding.',
  },
  {
    title: 'Marketing & Growth',
    slug: 'marketing-growth',
    description: 'Explore SEO strategies, content marketing, social media tactics, paid advertising, and viral marketing techniques.',
  },
  {
    title: 'Web Development',
    slug: 'web-development',
    description: 'Frontend and backend tutorials covering popular frameworks like React, Next.js, Node.js, and modern development practices.',
  },
  {
    title: 'SaaS Building',
    slug: 'saas-building',
    description: 'Learn how to build SaaS products, implement subscription models, optimize user onboarding, and reduce churn.',
  },
  {
    title: 'Product Management',
    slug: 'product-management',
    description: 'Master user research, UI/UX design principles, product roadmaps, and feature prioritization strategies.',
  },
  {
    title: 'Analytics & Data',
    slug: 'analytics-data',
    description: 'Understand tracking tools, key metrics, data-driven decision making, and conversion optimization techniques.',
  },
]

async function seedCategories() {
  try {
    // Initialize Payload with the config
    const payload = await getPayload({
      config: await config,
    })
    
    console.log('Starting to seed core categories...')

    for (const categoryData of CORE_CATEGORIES) {
      // Check if category already exists
      const existingCategories = await payload.find({
        collection: 'categories',
        where: {
          title: {
            equals: categoryData.title,
          },
        },
        limit: 1,
      })

      if (existingCategories.docs.length > 0) {
        console.log(`✓ Category "${categoryData.title}" already exists, skipping...`)
        continue
      }

      // Create new category
      const newCategory = await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      console.log(`✓ Created category: "${categoryData.title}" (ID: ${newCategory.id})`)
    }

    console.log('\n🎉 Category seeding completed successfully!')
    console.log(`Total categories processed: ${CORE_CATEGORIES.length}`)
    
    // Show all categories
    console.log('\n📋 Current categories in database:')
    const allCategories = await payload.find({
      collection: 'categories',
      sort: 'title',
    })
    
    allCategories.docs.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.title}`)
    })

  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  }
}

// Run the seeding function
seedCategories()
  .then(() => {
    console.log('\n✨ Seeding script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
