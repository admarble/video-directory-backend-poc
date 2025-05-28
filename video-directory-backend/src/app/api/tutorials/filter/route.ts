import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/getPayload';

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

interface TutorialFilterRequest {
  category?: string;
  skillLevel?: string;
  filter?: string;
  tools?: string;
  topics?: string;
  minViews?: string;
  publishedAfter?: string;
  limit?: string;
  page?: string;
}

interface TransformedTutorial {
  id: string;
  slug?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  title: string;
  description: string;
  channelName?: string;
  channelId?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  tools?: string[];
  topics?: string[];
  publishedAt?: string;
  duration?: number;
  thumbnailUrl?: string;
  viewCount?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  isApproved?: boolean;
  isAvailable?: boolean;
}

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
    const params: TutorialFilterRequest = {
      category: searchParams.get('category') || undefined,
      skillLevel: searchParams.get('skillLevel') || undefined,
      filter: searchParams.get('filter') || undefined,
      tools: searchParams.get('tools') || undefined,
      topics: searchParams.get('topics') || undefined,
      minViews: searchParams.get('minViews') || undefined,
      publishedAfter: searchParams.get('publishedAfter') || undefined,
      limit: searchParams.get('limit') || '20',
      page: searchParams.get('page') || '1'
    };

    const tools = params.tools?.split(',').map(t => t.trim());
    const topics = params.topics?.split(',').map(t => t.trim());
    const minViews = params.minViews ? parseInt(params.minViews) : undefined;
    const limit = parseInt(params.limit || '20');
    const page = parseInt(params.page || '1');

    const payload = await getPayloadClient();
    
    // Build the where clause for Payload CMS
    const whereClause: any = {
      published: { equals: true }
    };

    // Category filter (check if tutorial has any tools from this category)
    if (params.category && FILTER_CONFIG.categories[params.category as keyof typeof FILTER_CONFIG.categories]) {
      const categoryTools = FILTER_CONFIG.categories[params.category as keyof typeof FILTER_CONFIG.categories];
      whereClause.tags = {
        in: categoryTools.map(tool => tool.toLowerCase())
      };
    }

    // Skill level filter
    if (params.skillLevel) {
      whereClause.skillLevel = { equals: params.skillLevel };
    }

    // Specific tools filter
    if (tools && tools.length > 0) {
      whereClause.tags = {
        in: tools.map(tool => tool.toLowerCase())
      };
    }

    // Specific topics filter
    if (topics && topics.length > 0) {
      whereClause.categories = {
        in: topics.map(topic => topic.toLowerCase())
      };
    }

    // Minimum views filter
    if (minViews !== undefined) {
      whereClause.views = { greater_than_equal: minViews };
    }

    // Published after filter
    if (params.publishedAfter) {
      whereClause.publishedDate = { greater_than_equal: params.publishedAfter };
    }

    // Special filters
    if (params.filter === 'featured') {
      whereClause.isFeatured = { equals: true };
    } else if (params.filter === 'popular-week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereClause.publishedDate = { greater_than_equal: weekAgo.toISOString() };
    } else if (params.filter === 'trending') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereClause.publishedDate = { greater_than_equal: weekAgo.toISOString() };
      whereClause.views = { greater_than_equal: 100 };
    }

    // Sort order
    let sort = '-publishedDate'; // Default to newest first
    if (params.filter === 'popular-week' || params.filter === 'trending') {
      sort = '-views'; // Sort by views for popularity
    }

    // Execute the query
    const result = await payload.find({
      collection: 'videos',
      where: whereClause,
      sort,
      limit,
      page,
      depth: 1,
    })

    // Transform the data to match frontend expectations
    const tutorials: TransformedTutorial[] = result.docs.map((tutorial: any) => ({
      id: tutorial.id,
      slug: tutorial.slug || undefined,
      youtubeId: extractYouTubeId(tutorial.videoUrl),
      youtubeUrl: tutorial.videoUrl,
      title: tutorial.title,
      description: tutorial.description,
      channelName: typeof tutorial.creator === 'object' ? tutorial.creator?.name : undefined,
      channelId: typeof tutorial.creator === 'object' ? tutorial.creator?.id : undefined,
      skillLevel: tutorial.skillLevel || undefined,
      tools: Array.isArray(tutorial.tags) 
        ? tutorial.tags.map((tag: any) => typeof tag === 'string' ? tag : tag.name) 
        : [],
      topics: Array.isArray(tutorial.categories) 
        ? tutorial.categories.map((cat: any) => typeof cat === 'string' ? cat : cat.name) 
        : [],
      publishedAt: tutorial.publishedDate || undefined,
      duration: tutorial.duration || undefined,
      thumbnailUrl: typeof tutorial.thumbnail === 'object' ? tutorial.thumbnail?.url : undefined,
      viewCount: tutorial.views || 0,
      views: tutorial.views || 0,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
      isFeatured: tutorial.isFeatured || false,
      isApproved: tutorial.published || false,
      isAvailable: tutorial.published !== false
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
        category: params.category,
        skillLevel: params.skillLevel,
        filter: params.filter,
        tools,
        topics,
        minViews,
        publishedAfter: params.publishedAfter
      }
    });

  } catch (_error) {
    console.error('Error filtering tutorials:', _error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to filter tutorials',
        details: _error instanceof Error ? _error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to extract YouTube ID from URL
function extractYouTubeId(url: string): string | undefined {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : undefined;
}
