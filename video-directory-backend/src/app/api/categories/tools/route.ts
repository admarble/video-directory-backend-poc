import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../getPayload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'tags',
      limit: 100, // Get all tags
      sort: 'title',
    })

    // Extract unique tool names
    const tools = result.docs.map(tag => tag.title)

    return NextResponse.json({
      data: tools
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
