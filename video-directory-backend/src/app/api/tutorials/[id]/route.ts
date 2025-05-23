import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../getPayload'
import { transformVideo } from '../../../../utils/transformVideo'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    const { id } = params

    const video = await payload.findByID({
      collection: 'videos',
      id,
      depth: 2,
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Tutorial not found' }, 
        { status: 404 }
      )
    }

    // Check if video is published (unless user is authenticated)
    if (!video.published) {
      return NextResponse.json(
        { error: 'Tutorial not found' }, 
        { status: 404 }
      )
    }

    const transformedVideo = transformVideo(video)

    return NextResponse.json({
      data: transformedVideo
    })
  } catch (error) {
    console.error('Error fetching tutorial:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
