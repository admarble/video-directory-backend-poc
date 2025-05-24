import { NextResponse } from 'next/server';

/**
 * Filter configuration
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
  },
  skillLevels: ['beginner', 'intermediate', 'advanced']
};

/**
 * Get available filter categories and metadata
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        categories: Object.keys(FILTER_CONFIG.categories).map(category => ({
          name: category,
          slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tools: FILTER_CONFIG.categories[category as keyof typeof FILTER_CONFIG.categories],
          toolCount: FILTER_CONFIG.categories[category as keyof typeof FILTER_CONFIG.categories].length
        })),
        skillLevels: FILTER_CONFIG.skillLevels,
        popularityFilters: [
          { name: 'Popular This Week', slug: 'popular-week' },
          { name: 'Trending', slug: 'trending' },
          { name: 'Featured', slug: 'featured' }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
