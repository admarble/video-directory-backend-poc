import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../getPayload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    // Get total published tutorials
    const tutorialsResult = await payload.find({
      collection: 'videos',
      where: {
        published: { equals: true }
      },
      limit: 0, // Only get count
    })

    // Get total creators
    const creatorsResult = await payload.find({
      collection: 'creators',
      limit: 0, // Only get count
    })

    // Get total views by summing all video views
    const videosWithViews = await payload.find({
      collection: 'videos',
      where: {
        published: { equals: true }
      },
      limit: 1000, // Adjust based on your needs
    })

    const totalViews = videosWithViews.docs.reduce((sum, video) => {
      return sum + (video.views || 0)
    }, 0)

    return NextResponse.json({
      totalTutorials: tutorialsResult.totalDocs,
      totalChannels: creatorsResult.totalDocs,
      totalViews: totalViews,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
