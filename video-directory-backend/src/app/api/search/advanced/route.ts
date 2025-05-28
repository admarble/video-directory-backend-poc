import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'
import config from '@payload-config'

interface SearchFilters {
  categories?: string[]
  tags?: string[]
  skillLevel?: string
  minDuration?: number
  maxDuration?: number
  published?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const url = new URL(request.url)
    
    // Get search parameters
    const query = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '12'), 50) // Max 50 results
    const sortBy = url.searchParams.get('sort') || 'publishedDate'
    const sortOrder = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    
    // Parse filters
    const filters: SearchFilters = {
      categories: url.searchParams.get('categories')?.split(',').filter(Boolean),
      tags: url.searchParams.get('tags')?.split(',').filter(Boolean),
      skillLevel: url.searchParams.get('skillLevel') || undefined,
      minDuration: url.searchParams.get('minDuration') ? parseInt(url.searchParams.get('minDuration')!) : undefined,
      maxDuration: url.searchParams.get('maxDuration') ? parseInt(url.searchParams.get('maxDuration')!) : undefined,
      published: url.searchParams.get('published') !== 'false', // Default to true (only published)
    }

    // Build the search query
    const searchQuery: any = {
      published: { equals: filters.published }
    }

    // Add text search if query provided
    if (query.trim()) {
      searchQuery.or = [
        { title: { contains: query } },
        { description: { contains: query } },
      ]
    }

    // Add filters
    if (filters.categories?.length) {
      searchQuery.categories = { in: filters.categories }
    }
    if (filters.tags?.length) {
      searchQuery.tags = { in: filters.tags }
    }
    if (filters.skillLevel) {
      searchQuery.skillLevel = { equals: filters.skillLevel }
    }
    if (filters.minDuration || filters.maxDuration) {
      searchQuery.duration = {}
      if (filters.minDuration) searchQuery.duration.greater_than_equal = filters.minDuration
      if (filters.maxDuration) searchQuery.duration.less_than_equal = filters.maxDuration
    }

    // Execute search
    const results = await payload.find({
      collection: 'videos',
      where: searchQuery,
      page,
      limit,
      sort: sortOrder === 'asc' ? sortBy : `-${sortBy}`,
      depth: 2,
    })

    return NextResponse.json({
      ...results,
      query,
      filters,
      searchTime: Date.now(),
    })

  } catch (error) {
    console.error('Advanced search error:', error)
    return NextResponse.json(
      { error: 'Search failed', docs: [], totalDocs: 0 },
      { status: 500 }
    )
  }
}
