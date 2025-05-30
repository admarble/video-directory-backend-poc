import { NextResponse } from 'next/server'

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

export async function POST() {
  try {
    // Import payload dynamically to use the existing instance
    const { getPayloadClient } = await import('../../../getPayload')
    const payload = await getPayloadClient()
    
    const results: {
      created: Array<{ name: string; id: string }>;
      existing: string[];
      errors: Array<{ category: string; error: string }>;
    } = {
      created: [],
      existing: [],
      errors: [],
    }

    console.log('Starting to seed core categories via API...')

    for (const categoryData of CORE_CATEGORIES) {
      try {
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
          results.existing.push(categoryData.title)
          continue
        }

        // Create new category
        const newCategory = await payload.create({
          collection: 'categories',
          data: categoryData,
        })

        console.log(`✓ Created category: "${categoryData.title}" (ID: ${newCategory.id})`)
        results.created.push({
          name: categoryData.title,
          id: String(newCategory.id),
        })
      } catch (error) {
        console.error(`Error creating category "${categoryData.title}":`, error)
        results.errors.push({
          category: categoryData.title,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Get all categories to show current state
    const allCategories = await payload.find({
      collection: 'categories',
      sort: 'title',
    })

    const response = {
      success: true,
      message: 'Category seeding completed',
      results: {
        totalProcessed: CORE_CATEGORIES.length,
        created: results.created.length,
        existing: results.existing.length,
        errors: results.errors.length,
      },
      details: results,
      allCategories: allCategories.docs.map(cat => ({
        id: String(cat.id),
        name: cat.title,
        description: cat.description || '',
      })),
    }

    console.log('🎉 Category seeding completed successfully!')
    console.log(`Created: ${results.created.length}, Existing: ${results.existing.length}, Errors: ${results.errors.length}`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed categories',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

// Also allow GET requests for convenience
export async function GET() {
  try {
    const { getPayloadClient } = await import('../../../getPayload')
    const payload = await getPayloadClient()
    
    const allCategories = await payload.find({
      collection: 'categories',
      sort: 'title',
    })

    return NextResponse.json({
      success: true,
      categories: allCategories.docs.map(cat => ({
        id: String(cat.id),
        name: cat.title,
        description: cat.description || '',
      })),
      total: allCategories.docs.length,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
