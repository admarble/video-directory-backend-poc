import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/getPayload'

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload()

    // Get video statistics
    const totalVideos = await payload.count({ collection: 'videos' })
    const publishedVideos = await payload.count({
      collection: 'videos',
      where: { published: { equals: true } },
    })

    // Get categories
    const totalCategories = await payload.count({ collection: 'categories' })

    // Get tags
    const totalTags = await payload.count({ collection: 'tags' })

    // Get creators
    const totalCreators = await payload.count({ collection: 'creators' })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentVideos = await payload.count({
      collection: 'videos',
      where: {
        createdAt: { greater_than: thirtyDaysAgo.toISOString() },
      },
    })

    // Get recent media uploads
    const recentMedia = await payload.count({
      collection: 'media',
      where: {
        createdAt: { greater_than: thirtyDaysAgo.toISOString() },
      },
    })

    const analytics = {
      overview: {
        totalVideos: totalVideos.totalDocs,
        publishedVideos: publishedVideos.totalDocs,
        draftVideos: totalVideos.totalDocs - publishedVideos.totalDocs,
        totalCategories: totalCategories.totalDocs,
        totalTags: totalTags.totalDocs,
        totalCreators: totalCreators.totalDocs,
        recentActivity: recentVideos.totalDocs,
        recentMediaUploads: recentMedia.totalDocs,
      },
      performance: {
        cacheHitRate: Math.random() * 30 + 70, // Placeholder: 70-100%
        avgResponseTime: Math.random() * 100 + 50, // Placeholder: 50-150ms
        uptime: process.uptime(),
      },
      recentEvents: {
        totalEvents: recentVideos.totalDocs + recentMedia.totalDocs,
        videoCreations: recentVideos.totalDocs,
        mediaUploads: recentMedia.totalDocs,
      },
      timestamp: new Date().toISOString(),
    }

    // Add CORS headers for admin interface
    const response = NextResponse.json(analytics)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch (error) {
    console.error('Analytics dashboard error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
