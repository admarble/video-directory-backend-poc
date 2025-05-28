import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayloadClient()
    const { id } = await params

    // Get current video
    const video = await payload.findByID({
      collection: 'videos',
      id,
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Tutorial not found' }, 
        { status: 404 }
      )
    }

    // Increment view count
    const updatedVideo = await payload.update({
      collection: 'videos',
      id,
      data: {
        views: (video.views || 0) + 1,
      },
    })

    return NextResponse.json({
      views: updatedVideo.views,
      message: 'View count updated successfully'
    })
  } catch (error) {
    console.error('Error updating view count:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
