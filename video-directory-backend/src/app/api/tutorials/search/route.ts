import type { Where } from 'payload';
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'
import { transformVideos } from '../../../../utils/transformVideo'

type WhereClause = Where;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const q = searchParams.get('q') // General search query
    const topic = searchParams.get('topic') // Category filter
    const tool = searchParams.get('tool') // Tool filter
    const skillLevel = searchParams.get('skillLevel') // Skill level filter
    const creator = searchParams.get('creator') // Creator filter

    const where: WhereClause = {
      published: { equals: true },
    }

    // Handle topic parameter (maps to categories)
    if (topic) {
      // Find category by name and use its ID
      const payload = await getPayloadClient()
      const categoryResult = await payload.find({
        collection: 'categories',
        where: { name: { equals: topic } },
        limit: 1,
      })
      
      if (categoryResult.docs.length > 0) {
        where.categories = {
          in: [categoryResult.docs[0].id],
        }
      }
    }

    // Handle tool parameter (maps to tool tags)
    if (tool) {
      const payload = await getPayloadClient()
      const toolResult = await payload.find({
        collection: 'tags',
        where: { 
          and: [
            { name: { equals: tool } },
            { type: { equals: 'tool' } }
          ]
        },
        limit: 1,
      })
      
      if (toolResult.docs.length > 0) {
        where.tags = {
          in: [toolResult.docs[0].id],
        }
      }
    }

    // Handle skill level filter
    if (skillLevel) {
      where.skillLevel = { equals: skillLevel }
    }

    // Handle creator filter
    if (creator) {
      where.creator = { equals: creator }
    }

    // Handle general search query
    if (q) {
      where.or = [
        {
          title: {
            contains: q,
          },
        },
        {
          description: {
            contains: q,
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
      depth: 2,
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
    console.error('Error searching tutorials:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
