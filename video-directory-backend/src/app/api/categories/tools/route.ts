import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'tags',
      where: {
        type: { equals: 'tool' }
      },
      limit: 100, // Get all tool tags
      sort: 'name',
    })

    // Extract unique tool names
    const tools = result.docs.map(tag => tag.name)

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
