import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from '@/getPayload';

/**
 * Filter configuration matching the frontend
 */
const FILTER_CONFIG = {
  categories: {
    'AI & Automation': [
      'Zapier', 'Make.com', 'n8n', 'OpenAI', 'ChatGPT', 'AI Tools', 
      'Automation', 'Machine Learning'
    ],
    'Marketing & Growth': [
      'SEMrush', 'Ahrefs', 'Google Analytics', 'Facebook Ads', 'Google Ads',
      'Email Marketing', 'Social Media', 'Content Marketing', 'Growth Hacking'
    ],
    'No-Code/Low-Code': [
      'Bubble', 'Webflow', 'Airtable', 'Notion', 'Framer', 'Carrd', 
      'Ghost', 'WordPress'
    ],
    'Web Development': [
      'React', 'Next.js', 'Vue.js', 'Node.js', 'JavaScript', 'TypeScript',
      'HTML', 'CSS', 'Web Development', 'Frontend', 'Backend', 'Full Stack'
    ]
  }
};

/**
 * Get tutorials filtered by various criteria
 * 
 * Query params:
 * - category: Tool category (AI & Automation, etc.)
 * - skillLevel: beginner, intermediate, advanced
 * - filter: popular-week, trending, featured
 * - tools: comma-separated list of specific tools
 * - topics: comma-separated list of topics
 * - minViews: minimum view count
 * - publishedAfter: ISO date string
 * - limit: number of results (default: 20)
 * - page: page number (default: 1)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category');
    const skillLevel = searchParams.get('skillLevel');
    const filter = searchParams.get('filter');
    const tools = searchParams.get('tools')?.split(',').map(t => t.trim());
    const topics = searchParams.get('topics')?.split(',').map(t => t.trim());
    const minViews = searchParams.get('minViews') ? parseInt(searchParams.get('minViews')!) : undefined;
    const publishedAfter = searchParams.get('publishedAfter');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const payload = await getPayload();
    
    // Build the where clause for Payload CMS
    const whereClause: any = {
      isApproved: { equals: true },
      isAvailable: { equals: true }
    };

    // Category filter (check if tutorial has any tools from this category)
    if (category && FILTER_CONFIG.categories[category as keyof typeof FILTER_CONFIG.categories]) {
      const categoryTools = FILTER_CONFIG.categories[category as keyof typeof FILTER_CONFIG.categories];
      whereClause.tools = {
        in: categoryTools.map(tool => tool.toLowerCase())
      };
    }

    // Skill level filter
    if (skillLevel) {
      whereClause.skillLevel = { equals: skillLevel };
    }

    // Specific tools filter
    if (tools && tools.length > 0) {
      whereClause.tools = {
        in: tools.map(tool => tool.toLowerCase())
      };
    }

    // Specific topics filter
    if (topics && topics.length > 0) {
      whereClause.topics = {
        in: topics.map(topic => topic.toLowerCase())
      };
    }

    // Minimum views filter
    if (minViews !== undefined) {
      whereClause.views = { greater_than_equal: minViews };
    }

    // Published after filter
    if (publishedAfter) {
      whereClause.publishedAt = { greater_than_equal: publishedAfter };
    }

    // Special filters
    if (filter === 'featured') {
      whereClause.isFeatured = { equals: true };
    } else if (filter === 'popular-week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereClause.publishedAt = { greater_than_equal: weekAgo.toISOString() };
    } else if (filter === 'trending') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereClause.publishedAt = { greater_than_equal: weekAgo.toISOString() };
      whereClause.views = { greater_than_equal: 100 };
    }

    // Sort order
    let sort = '-publishedAt'; // Default to newest first
    if (filter === 'popular-week' || filter === 'trending') {
      sort = '-views'; // Sort by views for popularity
    }

    // Execute the query
    const result = await payload.find({
      collection: 'tutorials',
      where: whereClause,
      sort,
      limit,
      page,
      depth: 1,
    });

    // Transform the data to match frontend expectations
    const tutorials = result.docs.map((tutorial: any) => ({
      id: tutorial.id,
      slug: tutorial.slug,
      youtubeId: tutorial.youtubeId,
      youtubeUrl: tutorial.youtubeUrl,
      title: tutorial.title,
      description: tutorial.description,
      channelName: tutorial.channelName,
      channelId: tutorial.channelId,
      skillLevel: tutorial.skillLevel,
      tools: tutorial.tools || [],
      topics: tutorial.topics || [],
      publishedAt: tutorial.publishedAt,
      duration: tutorial.duration,
      thumbnailUrl: tutorial.thumbnailUrl,
      viewCount: tutorial.viewCount || 0,
      views: tutorial.views || 0,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
      isFeatured: tutorial.isFeatured || false,
      isApproved: tutorial.isApproved || false,
      isAvailable: tutorial.isAvailable !== false
    }));

    return NextResponse.json({
      success: true,
      data: tutorials,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      },
      filters: {
        category,
        skillLevel,
        filter,
        tools,
        topics,
        minViews,
        publishedAfter
      }
    });

  } catch (error) {
    console.error('Error filtering tutorials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to filter tutorials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
