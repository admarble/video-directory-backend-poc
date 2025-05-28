import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'categories',
      limit: 100, // Get all categories
      sort: 'name',
    })

    // Extract unique category names
    const topics = result.docs.map(category => category.name)

    return NextResponse.json({
      data: topics
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
