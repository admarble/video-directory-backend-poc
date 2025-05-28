import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    
    // Validate required fields
    if (!body.videoId) {
      return NextResponse.json(
        { error: 'Video ID is required', success: false },
        { status: 400 }
      )
    }

    if (!body.updates || typeof body.updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required', success: false },
        { status: 400 }
      )
    }

    // Allowed fields for updates (security measure)
    const allowedFields = [
      'title', 'description', 'published', 'tags', 'categories',
      'skillLevel', 'duration', 'notes', 'featured'
    ]

    // Filter to only allowed fields
    const filteredUpdates: any = {}
    for (const [key, value] of Object.entries(body.updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields provided for update. Allowed fields: ' + allowedFields.join(', '),
          success: false 
        },
        { status: 400 }
      )
    }

    // Update the video
    const updatedVideo = await payload.update({
      collection: 'videos',
      id: body.videoId,
      data: filteredUpdates,
    })

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Video updated successfully',
      updatedFields: Object.keys(filteredUpdates)
    })

  } catch (error) {
    console.error('Update video error:', error)
    
    // Handle specific Payload errors
    if (error instanceof Error) {
      if (error.message.includes('No Video found')) {
        return NextResponse.json(
          { error: 'Video not found', success: false },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update video', success: false, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Also support PATCH method for RESTful compliance
export async function PATCH(request: Request) {
  return POST(request)
}
