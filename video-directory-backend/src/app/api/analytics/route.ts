import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayload'
import type { 
  AnalyticsData, 
  PopularVideo, 
  RecentActivity, 
  CategoryWithCount, 
  SkillDistribution, 
  DurationStats
} from '@/types/api'
import type { Category } from '@/payload-types'

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
    
    const totalViews = viewsResult.docs.reduce((sum: number, video) => sum + (video.views || 0), 0)

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

    const skillDistribution: SkillDistribution = skillLevels.docs.reduce((acc: SkillDistribution, video) => {
      const level = video.skillLevel || 'beginner'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as SkillDistribution)

    // Get duration statistics
    const durations = await payload.find({
      collection: 'videos',
      where: { published: { equals: true } },
      limit: 1000,
      select: { duration: true }
    })

    const durationStats: DurationStats = durations.docs.reduce((acc: DurationStats, video) => {
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

    const analytics: AnalyticsData = {
      overview: {
        totalVideos: totalVideos.totalDocs,
        newVideos: newVideos.totalDocs,
        totalViews,
        growthRate: `${growthRate}%`,
        timeframe
      },
      topCategories: topCategories.docs.map((cat: Category): CategoryWithCount => ({
        id: cat.id,
        name: cat.title, // Categories use 'title' field not 'name'
        videoCount: 0 // This would need a separate query to count videos per category
      })),
      popularVideos: popularVideos.docs.map((video): PopularVideo => ({
        id: video.id,
        title: video.title,
        views: video.views || 0,
        categories: Array.isArray(video.categories) 
          ? video.categories.map((cat) => typeof cat === 'string' ? cat : cat.title) 
          : [],
        creator: typeof video.creator === 'string' ? 'Unknown' : video.creator?.name || 'Unknown',
        thumbnail: typeof video.thumbnail === 'string' ? undefined : video.thumbnail?.url || undefined
      })),
      recentActivity: recentVideos.docs.map((video): RecentActivity => ({
        id: video.id,
        title: video.title,
        createdAt: video.createdAt,
        categories: Array.isArray(video.categories) 
          ? video.categories.map((cat) => typeof cat === 'string' ? cat : cat.title) 
          : [],
        creator: typeof video.creator === 'string' ? 'Unknown' : video.creator?.name || 'Unknown'
      })),
      distributions: {
        skillLevel: skillDistribution,
        duration: durationStats
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(analytics)

  } catch (_error) {
    console.error('Analytics API error:', _error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// POST endpoint for tracking custom events
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json() as { event: string; data?: unknown }
    
    // Here you could store custom analytics events
    // For now, we'll just log them
    console.log('Analytics event:', { event, data, timestamp: new Date().toISOString() })
    
    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
