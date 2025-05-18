// Import Payload types to resolve Where type issue
import type { Where } from 'payload';

import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../getPayload'

// Use a more generic type with an index signature to match Payload's Where type
// Extending the Where type from Payload for better compatibility
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

    const where: WhereClause = {
      published: { equals: true },
    }

    if (category) {
      where.categories = {
        in: [category],
      }
    }

    if (tag) {
      where.tags = {
        in: [tag],
      }
    }

    if (creator) {
      where.creator = {
        equals: creator,
      }
    }

    if (search) {
      where.or = [
        {
          title: {
            like: search,
          },
        },
        {
          description: {
            like: search,
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
      depth: 1,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 