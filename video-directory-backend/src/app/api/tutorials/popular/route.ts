import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../getPayload'
import { transformVideos } from '../../../../utils/transformVideo'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'videos',
      where: {
        published: { equals: true }
      },
      sort: '-views', // Sort by views in descending order
      page,
      limit,
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
    console.error('Error fetching popular tutorials:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
