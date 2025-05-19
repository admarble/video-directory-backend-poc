import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Function to extract YouTube video ID from URL
function extractVideoId(url: string): string | null {
  try {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  const hours = (match?.[1] && parseInt(match[1])) || 0;
  const minutes = (match?.[2] && parseInt(match[2])) || 0;
  const seconds = (match?.[3] && parseInt(match[3])) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Custom category mapping for indie hackers and developers
// Maps YouTube categories to our specialized categories based on content type
const YOUTUBE_CATEGORY_MAPPING: Record<string, string> = {
  '27': 'Business Strategy', // Education -> Business Strategy
  '28': 'AI & Automation', // Science & Technology -> AI & Automation  
  '26': 'No-Code/Low-Code', // Howto & Style -> No-Code/Low-Code
  '25': 'Marketing & Growth', // News & Politics -> Marketing & Growth (for business news/strategies)
  '22': 'SaaS Building', // People & Blogs -> SaaS Building (for personal experiences/stories)
  '24': 'Product Management', // Entertainment -> Product Management (for engaging educational content)
};

// Enhanced keyword detection for indie hacker and developer content
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Business Strategy': [
    'business model', 'revenue model', 'pricing strategy', 'idea validation', 'mvp', 'lean startup',
    'market research', 'competitive analysis', 'go-to-market', 'business plan', 'monetization',
    'customer validation', 'product-market fit', 'pivot', 'scaling', 'growth strategy',
    'indie hacker', 'solopreneur', 'bootstrap', 'entrepreneurship', 'startup journey'
  ],
  'AI & Automation': [
    'artificial intelligence', 'machine learning', 'ai tools', 'cursor ai', 'github copilot',
    'chatgpt', 'automation', 'workflow automation', 'zapier', 'n8n', 'integrations',
    'ai coding', 'code generation', 'gpt', 'ai assistant', 'prompt engineering',
    'langchain', 'openai', 'anthropic', 'claude', 'midjourney', 'stable diffusion'
  ],
  'No-Code/Low-Code': [
    'no-code', 'low-code', 'nocode', 'webflow', 'bubble', 'supabase', 'airtable',
    'notion', 'zapier', 'make', 'automate', 'drag and drop', 'visual builder',
    'database design', 'backend as a service', 'baas', 'firebase', 'appwrite',
    'retool', 'glide', 'adalo', 'buildship', 'flutterflow'
  ],
  'Marketing & Growth': [
    'marketing', 'growth hacking', 'seo', 'content marketing', 'social media marketing',
    'paid advertising', 'facebook ads', 'google ads', 'viral marketing', 'influencer marketing',
    'email marketing', 'conversion optimization', 'landing pages', 'copywriting',
    'brand building', 'community building', 'product hunt', 'growth loops', 'referral marketing',
    'organic growth', 'inbound marketing', 'content strategy', 'social proof'
  ],
  'Web Development': [
    'web development', 'frontend', 'backend', 'full stack', 'react', 'nextjs', 'next.js',
    'node.js', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'api development',
    'rest api', 'graphql', 'database', 'deployment', 'vercel', 'netlify', 'aws',
    'docker', 'ci/cd', 'testing', 'performance optimization', 'responsive design',
    'vue', 'angular', 'svelte', 'remix', 'astro', 'nuxt'
  ],
  'SaaS Building': [
    'saas', 'software as a service', 'subscription model', 'recurring revenue', 'mrr',
    'arr', 'churn reduction', 'user onboarding', 'saas metrics', 'customer success',
    'saas marketing', 'freemium', 'pricing tiers', 'user retention', 'ltv',
    'saas architecture', 'multi-tenancy', 'billing systems', 'stripe integration',
    'customer acquisition', 'saas growth', 'product led growth', 'user engagement'
  ],
  'Product Management': [
    'product management', 'user experience', 'user interface', 'ux design', 'ui design',
    'user research', 'product roadmap', 'feature prioritization', 'user testing',
    'design thinking', 'wireframing', 'prototyping', 'figma', 'sketch',
    'user journey', 'personas', 'mvp design', 'usability testing', 'a/b testing',
    'product strategy', 'requirements gathering', 'agile', 'scrum', 'product analytics'
  ],
  'Analytics & Data': [
    'analytics', 'data analysis', 'google analytics', 'tracking', 'metrics',
    'conversion tracking', 'data visualization', 'dashboard', 'kpi', 'roi',
    'cohort analysis', 'funnel analysis', 'attribution', 'mixpanel', 'amplitude',
    'segment', 'hotjar', 'heatmaps', 'user behavior', 'data-driven decisions',
    'performance metrics', 'business intelligence', 'reporting', 'data science',
    'sql', 'tableau', 'power bi', 'looker'
  ]
};

// Function to find or create categories in the database
async function findOrCreateCategories(categoryNames: string[]): Promise<string[]> {
  try {
    // Import payload dynamically to avoid issues with server components
    const { getPayloadClient } = await import('../../../getPayload');
    const payload = await getPayloadClient();
    
    const categoryIds: string[] = [];
    
    for (const categoryName of categoryNames) {
      // First, try to find an existing category with this name
      const existingCategories = await payload.find({
        collection: 'categories',
        where: {
          name: {
            equals: categoryName,
          },
        },
        limit: 1,
      });
      
      if (existingCategories.docs.length > 0) {
        // Category already exists, use its ID
        categoryIds.push(existingCategories.docs[0].id);
      } else {
        // Category doesn't exist, create a new one
        const newCategory = await payload.create({
          collection: 'categories',
          data: {
            name: categoryName,
            description: `Automatically created from YouTube video categorization`,
          },
        });
        categoryIds.push(newCategory.id);
      }
    }
    
    return categoryIds;
  } catch (error) {
    console.error('Error processing categories:', error);
    return []; // Return empty array if category processing fails
  }
}

// Function to detect categories from YouTube data
async function detectCategories(categoryId: string, title: string, description: string): Promise<string[]> {
  const categories: Set<string> = new Set();
  
  // 1. Map YouTube category ID to our specialized category
  if (categoryId && YOUTUBE_CATEGORY_MAPPING[categoryId]) {
    categories.add(YOUTUBE_CATEGORY_MAPPING[categoryId]);
  }
  
  // 2. Detect additional categories from keywords in title and description
  const searchText = (title + ' ' + description).toLowerCase();
  
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hasKeyword = keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      categories.add(categoryName);
    }
  }
  
  // 3. Fallback: If no categories detected, use "Web Development" as default
  // This ensures every video gets at least one category
  if (categories.size === 0) {
    categories.add('Web Development');
  }
  
  return Array.from(categories);
}

// Function to find or create a creator in the database
async function findOrCreateCreator(channelId: string, channelTitle: string): Promise<string | null> {
  try {
    // Import payload dynamically to avoid issues with server components
    const { getPayloadClient } = await import('../../../getPayload');
    const payload = await getPayloadClient();
    
    // First, try to find an existing creator with this channel ID
    // We'll use the socialLinks array to check for existing YouTube channel links
    const existingCreators = await payload.find({
      collection: 'creators',
      where: {
        or: [
          {
            'socialLinks.platform': {
              equals: 'youtube',
            },
            'socialLinks.url': {
              contains: channelId,
            },
          },
          {
            name: {
              equals: channelTitle,
            },
          },
        ],
      },
      limit: 1,
    });
    
    if (existingCreators.docs.length > 0) {
      // Creator already exists, return its ID
      return existingCreators.docs[0].id;
    } else {
      // Creator doesn't exist, create a new one
      const channelUrl = `https://www.youtube.com/channel/${channelId}`;
      
      const newCreator = await payload.create({
        collection: 'creators',
        data: {
          name: channelTitle,
          bio: `YouTube creator - automatically imported from YouTube API`,
          socialLinks: [
            {
              platform: 'youtube',
              url: channelUrl,
            },
          ],
        },
      });
      
      return newCreator.id;
    }
  } catch (error) {
    console.error('Error processing creator:', error);
    return null; // Return null if creator processing fails
  }
}

// Function to find or create tags in the database
async function findOrCreateTags(tags: string[]): Promise<string[]> {
  try {
    // Import payload dynamically to avoid issues with server components
    const { getPayloadClient } = await import('../../../getPayload');
    const payload = await getPayloadClient();
    
    const tagIds: string[] = [];
    
    for (const tagName of tags) {
      // First, try to find an existing tag with this name
      const existingTags = await payload.find({
        collection: 'tags',
        where: {
          name: {
            equals: tagName,
          },
        },
        limit: 1,
      });
      
      if (existingTags.docs.length > 0) {
        // Tag already exists, use its ID
        tagIds.push(existingTags.docs[0].id);
      } else {
        // Tag doesn't exist, create a new one
        const newTag = await payload.create({
          collection: 'tags',
          data: {
            name: tagName,
            description: `Automatically created from YouTube video tags`,
          },
        });
        tagIds.push(newTag.id);
      }
    }
    
    return tagIds;
  } catch (error) {
    console.error('Error processing tags:', error);
    return []; // Return empty array if tag processing fails
  }
}

// Function to download and upload thumbnail to Payload
async function uploadThumbnailToPayload(thumbnailUrl: string, title: string) {
  try {
    // Import payload dynamically to avoid issues with server components
    const { getPayloadClient } = await import('../../../getPayload');
    const payload = await getPayloadClient();
    
    // Download the thumbnail image
    const imageResponse = await fetch(thumbnailUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download thumbnail: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    const imageBlob = new Blob([buffer], { type: imageResponse.headers.get('content-type') || 'image/jpeg' });
    
    // Create a filename based on the video title
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    const filename = `${cleanTitle}-thumbnail-${randomUUID().substring(0, 8)}.jpg`;
    
    // Create a File object from the blob
    const _file = new File([imageBlob], filename, { type: 'image/jpeg' });
    
    // Upload to Payload's media collection
    const uploadResult = await payload.create({
      collection: 'media',
      data: {
        alt: `Thumbnail for ${title}`,
      },
      file: {
        data: buffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: buffer.length,
      },
    });
    
    return uploadResult.id;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return null; // Return null if upload fails, don't break the whole process
  }
}

// Route handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const uploadThumbnail = searchParams.get('uploadThumbnail') === 'true';
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
    }
    
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('YouTube API error:', errorData);
      return NextResponse.json({ 
        error: `YouTube API error: ${response.status} ${response.statusText}`,
        details: errorData
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found or not accessible' }, { status: 404 });
    }
    
    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    
    // Base response
    const responseData = {
      title: snippet.title,
      description: snippet.description,
      duration: parseDuration(contentDetails.duration),
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      publishedDate: snippet.publishedAt,
      thumbnailId: null as string | null,
      tagIds: [] as string[],
      creatorId: null as string | null,
      categoryIds: [] as string[]
    };
    
    // Process creator information
    if (snippet.channelId && snippet.channelTitle) {
      responseData.creatorId = await findOrCreateCreator(snippet.channelId, snippet.channelTitle);
    }
    
    // Process categories from YouTube data and content keywords
    const detectedCategories = await detectCategories(snippet.categoryId, snippet.title, snippet.description);
    if (detectedCategories.length > 0) {
      responseData.categoryIds = await findOrCreateCategories(detectedCategories);
    }
    
    // Optionally upload thumbnail to Payload
    if (uploadThumbnail && responseData.thumbnailUrl) {
      responseData.thumbnailId = await uploadThumbnailToPayload(
        responseData.thumbnailUrl,
        responseData.title
      );
    }
    
    // Process tags if they exist
    if (snippet.tags && Array.isArray(snippet.tags) && snippet.tags.length > 0) {
      responseData.tagIds = await findOrCreateTags(snippet.tags);
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
  }
}