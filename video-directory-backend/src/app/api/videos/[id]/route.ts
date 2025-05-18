import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    const video = await payload.findByID({
      collection: 'videos',
      id,
      depth: 2,
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Increment view count or add other analytics here if needed

    return NextResponse.json(video)
  } catch (error) {
    console.error(`Error fetching video with ID ${await params.then(p => p.id)}:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 