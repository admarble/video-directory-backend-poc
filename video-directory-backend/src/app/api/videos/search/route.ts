import type { Where } from 'payload';
import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../getPayload'
import { transformVideos } from '../../../../utils/transformVideo'

type WhereClause = Where;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const creator = searchParams.get('creator')
    const search = searchParams.get('search')
    const topic = searchParams.get('topic') // New parameter
    const tool = searchParams.get('tool') // New parameter
    const q = searchParams.get('q') // Alternative search parameter

    const where: WhereClause = {
      published: { equals: true },
    }

    if (category) {
      where.categories = {
        in: [category],
      }
    }

    // Handle topic parameter (maps to categories)
    if (topic) {
      where.categories = {
        in: [topic],
      }
    }

    if (tag) {
      where.tags = {
        in: [tag],
      }
    }

    // Handle tool parameter (maps to tool tags)
    if (tool) {
      where.tags = {
        in: [tool],
      }
    }

    if (creator) {
      where.creator = {
        equals: creator,
      }
    }

    // Handle both 'search' and 'q' parameters
    const searchQuery = search || q
    if (searchQuery) {
      where.or = [
        {
          title: {
            like: searchQuery,
          },
        },
        {
          description: {
            like: searchQuery,
          },
        },
      ]
    }

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'videos',
      where,
      page,
      limit,
      sort: '-publishedDate',
      depth: 2, // Increased depth for proper relations
    })

    const transformedVideos = transformVideos(result.docs)

    return NextResponse.json({
      data: transformedVideos,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 