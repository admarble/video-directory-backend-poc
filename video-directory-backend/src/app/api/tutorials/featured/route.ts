import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../getPayload'
import { transformVideos } from '../../../../utils/transformVideo'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'videos',
      where: {
        and: [
          { published: { equals: true } },
          { isFeatured: { equals: true } }
        ]
      },
      sort: '-publishedDate',
      depth: 2,
    })

    const transformedVideos = transformVideos(result.docs)

    return NextResponse.json({
      data: transformedVideos
    })
  } catch (error) {
    console.error('Error fetching featured tutorials:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
