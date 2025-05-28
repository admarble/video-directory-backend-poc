import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    const daysBack = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeframe] || 30

    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get total videos
    const totalVideos = await payload.count({
      collection: 'videos',
      where: { published: { equals: true } }
    })

    // Get recent videos
    const newVideos = await payload.count({
      collection: 'videos',
      where: {
        published: { equals: true },
        createdAt: { greater_than: startDate.toISOString() }
      }
    })

    // Get total views
    const viewsResult = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 1000, // Adjust based on your video count
      select: { views: true }
    })
    
    const totalViews = viewsResult.docs.reduce((sum: number, video: any) => sum + (video.views || 0), 0)

    // Get top categories
    const topCategories = await payload.find({
      collection: 'categories',
      limit: 10,
    })

    // Get popular videos
    const popularVideos = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 10,
      sort: '-views',
      depth: 2
    })

    // Get recent activity
    const recentVideos = await payload.find({
      collection: 'videos',
      where: { 
        published: { equals: true },
        createdAt: { greater_than: startDate.toISOString() }
      },
      limit: 10,
      sort: '-createdAt',
      depth: 2
    })

    // Get skill level distribution
    const skillLevels = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 1000,
      select: { skillLevel: true }
    })

    const skillDistribution = skillLevels.docs.reduce((acc: any, video: any) => {
      const level = video.skillLevel || 'beginner'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

    // Get duration statistics
    const durations = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 1000,
      select: { duration: true }
    })

    const durationStats = durations.docs.reduce((acc: any, video: any) => {
      const duration = video.duration || 0
      if (duration < 300) acc.short++ // < 5 min
      else if (duration < 900) acc.medium++ // 5-15 min
      else acc.long++ // > 15 min
      return acc
    }, { short: 0, medium: 0, long: 0 })

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    const previousVideos = await payload.count({
      collection: 'videos',
      where: {
        published: { equals: true },
        createdAt: { 
          greater_than: previousPeriodStart.toISOString(),
          less_than: startDate.toISOString()
        }
      }
    })

    const growthRate = previousVideos.totalDocs > 0 
      ? ((newVideos.totalDocs - previousVideos.totalDocs) / previousVideos.totalDocs * 100).toFixed(1)
      : '100'

    const analytics = {
      overview: {
        totalVideos: totalVideos.totalDocs,
        newVideos: newVideos.totalDocs,
        totalViews,
        growthRate: `${growthRate}%`,
        timeframe
      },
      topCategories: topCategories.docs.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        videoCount: cat.videos?.length || 0
      })),
      popularVideos: popularVideos.docs.map((video: any) => ({
        id: video.id,
        title: video.title,
        views: video.views || 0,
        categories: video.categories?.map((cat: any) => cat.name) || [],
        creator: video.creator?.name || 'Unknown',
        thumbnail: video.thumbnail?.url
      })),
      recentActivity: recentVideos.docs.map((video: any) => ({
        id: video.id,
        title: video.title,
        createdAt: video.createdAt,
        categories: video.categories?.map((cat: any) => cat.name) || [],
        creator: video.creator?.name || 'Unknown'
      })),
      distributions: {
        skillLevel: skillDistribution,
        duration: durationStats
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// POST endpoint for tracking custom events
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()
    
    // Here you could store custom analytics events
    // For now, we'll just log them
    console.log('Analytics event:', { event, data, timestamp: new Date().toISOString() })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
