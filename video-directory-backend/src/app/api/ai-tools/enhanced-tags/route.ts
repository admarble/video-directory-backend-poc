import { NextResponse } from 'next/server';
import { validateAutomationUser } from '../../../../utils/validateAutomationUser';

// Enhanced tag analysis and suggestion
function generateEnhancedTags(title: string, description: string, existingTags: string[] = []): {
  suggestedTags: { name: string; type: 'tool' | 'general'; confidence: number; reasoning: string }[];
  enhancedExisting: string[];
} {
  const content = `${title} ${description}`.toLowerCase();
  
  // Tool/Technology detection
  const toolKeywords = {
    // Web Technologies
    'React': ['react', 'jsx', 'react.js', 'reactjs'],
    'Next.js': ['next.js', 'nextjs', 'next js'],
    'Vue.js': ['vue', 'vue.js', 'vuejs'],
    'Angular': ['angular', 'angular.js'],
    'Svelte': ['svelte', 'sveltekit'],
    'Node.js': ['node', 'node.js', 'nodejs'],
    'Express': ['express', 'express.js'],
    'TypeScript': ['typescript', 'ts'],
    'JavaScript': ['javascript', 'js'],
    'HTML': ['html', 'html5'],
    'CSS': ['css', 'css3', 'styling'],
    'Tailwind CSS': ['tailwind', 'tailwindcss'],
    'Bootstrap': ['bootstrap'],
    'Sass': ['sass', 'scss'],
    
    // Backend & Database
    'MongoDB': ['mongodb', 'mongo'],
    'PostgreSQL': ['postgresql', 'postgres'],
    'MySQL': ['mysql'],
    'Redis': ['redis'],
    'GraphQL': ['graphql'],
    'REST API': ['rest', 'api', 'restful'],
    'Docker': ['docker', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s'],
    
    // Cloud & Deployment
    'AWS': ['aws', 'amazon web services'],
    'Vercel': ['vercel'],
    'Netlify': ['netlify'],
    'Heroku': ['heroku'],
    'Firebase': ['firebase'],
    'Supabase': ['supabase'],
    
    // AI & Automation
    'OpenAI': ['openai', 'gpt', 'chatgpt'],
    'Claude': ['claude', 'anthropic'],
    'Cursor AI': ['cursor', 'cursor ai'],
    'GitHub Copilot': ['copilot', 'github copilot'],
    'Zapier': ['zapier'],
    'n8n': ['n8n'],
    'Make': ['make', 'integromat'],
    
    // No-Code/Low-Code
    'Webflow': ['webflow'],
    'Bubble': ['bubble'],
    'Airtable': ['airtable'],
    'Notion': ['notion'],
    'Retool': ['retool'],
    'Glide': ['glide'],
    
    // CMS & Content
    'WordPress': ['wordpress'],
    'Contentful': ['contentful'],
    'Strapi': ['strapi'],
    'Payload CMS': ['payload', 'payload cms'],
    'Sanity': ['sanity'],
    
    // Design & Prototyping
    'Figma': ['figma'],
    'Sketch': ['sketch'],
    'Adobe XD': ['adobe xd', 'xd'],
    'Framer': ['framer'],
    
    // Testing & DevOps
    'Jest': ['jest'],
    'Cypress': ['cypress'],
    'Playwright': ['playwright'],
    'GitHub Actions': ['github actions'],
    'CI/CD': ['ci/cd', 'cicd', 'continuous integration'],
  };
  
  // General concept keywords
  const generalKeywords = {
    // Programming Concepts
    'Authentication': ['auth', 'authentication', 'login', 'oauth'],
    'Authorization': ['authorization', 'permissions', 'access control'],
    'State Management': ['state', 'redux', 'zustand', 'context'],
    'Routing': ['routing', 'navigation', 'router'],
    'Performance': ['performance', 'optimization', 'speed'],
    'SEO': ['seo', 'search engine optimization'],
    'Testing': ['testing', 'unit test', 'integration test'],
    'Deployment': ['deployment', 'deploy', 'hosting'],
    'Monitoring': ['monitoring', 'analytics', 'tracking'],
    
    // Business Concepts
    'Monetization': ['monetization', 'revenue', 'pricing'],
    'Growth Hacking': ['growth', 'marketing', 'viral'],
    'User Experience': ['ux', 'user experience', 'usability'],
    'User Interface': ['ui', 'user interface', 'design'],
    'MVP': ['mvp', 'minimum viable product'],
    'Product-Market Fit': ['product market fit', 'pmf'],
    'Customer Acquisition': ['acquisition', 'customer', 'users'],
    'Retention': ['retention', 'churn', 'engagement'],
    
    // Development Practices
    'Agile': ['agile', 'scrum', 'sprint'],
    'DevOps': ['devops', 'infrastructure'],
    'API Design': ['api design', 'rest', 'graphql'],
    'Database Design': ['database', 'schema', 'data modeling'],
    'Security': ['security', 'encryption', 'vulnerability'],
    'Scalability': ['scaling', 'scalability', 'load'],
  };
  
  const suggestedTags: { name: string; type: 'tool' | 'general'; confidence: number; reasoning: string }[] = [];
  const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
  
  // Check for tool/technology matches
  for (const [toolName, keywords] of Object.entries(toolKeywords)) {
    if (existingTagsLower.includes(toolName.toLowerCase())) continue;
    
    const matchingKeywords = keywords.filter(keyword => content.includes(keyword));
    if (matchingKeywords.length > 0) {
      const confidence = Math.min(0.95, 0.7 + (matchingKeywords.length * 0.1));
      suggestedTags.push({
        name: toolName,
        type: 'tool',
        confidence,
        reasoning: `Detected keywords: ${matchingKeywords.join(', ')}`
      });
    }
  }
  
  // Check for general concept matches
  for (const [conceptName, keywords] of Object.entries(generalKeywords)) {
    if (existingTagsLower.includes(conceptName.toLowerCase())) continue;
    
    const matchingKeywords = keywords.filter(keyword => content.includes(keyword));
    if (matchingKeywords.length > 0) {
      const confidence = Math.min(0.9, 0.6 + (matchingKeywords.length * 0.1));
      suggestedTags.push({
        name: conceptName,
        type: 'general',
        confidence,
        reasoning: `Detected keywords: ${matchingKeywords.join(', ')}`
      });
    }
  }
  
  // Sort by confidence and limit to top suggestions
  suggestedTags.sort((a, b) => b.confidence - a.confidence);
  const topSuggestions = suggestedTags.slice(0, 8);
  
  // Enhance existing tags (clean up formatting, suggest related tags)
  const enhancedExisting = existingTags.map(tag => {
    // Clean up common formatting issues
    return tag
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capitals
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case
      .trim();
  });
  
  return {
    suggestedTags: topSuggestions,
    enhancedExisting
  };
}

// Function to create tags in the database
async function createTagsInDatabase(tagSuggestions: { name: string; type: 'tool' | 'general' }[]): Promise<string[]> {
  try {
    const { getPayloadClient } = await import('../../../../getPayload');
    const payload = await getPayloadClient();
    
    const createdTagIds: string[] = [];
    
    for (const suggestion of tagSuggestions) {
      // Check if tag already exists
      const existingTags = await payload.find({
        collection: 'tags',
        where: {
          title: { equals: suggestion.name }
        },
        limit: 1
      });
      
      if (existingTags.docs.length > 0) {
        createdTagIds.push(String(existingTags.docs[0].id));
      } else {
        // Create new tag
        const newTag = await payload.create({
          collection: 'tags',
          data: {
            title: suggestion.name,
            slug: suggestion.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description: `Auto-generated ${suggestion.type} tag from AI analysis`
          }
        });
        createdTagIds.push(String(newTag.id));
      }
    }
    
    return createdTagIds;
  } catch (error) {
    console.error('Error creating tags:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    // Validate automation user
    const authResult = await validateAutomationUser(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, existingTags = [], videoId, createTags = false, confidenceThreshold = 0.7 } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Generate enhanced tags
    const analysis = generateEnhancedTags(title, description || '', existingTags);
    
    // Filter by confidence threshold
    const highConfidenceTags = analysis.suggestedTags.filter(tag => tag.confidence >= confidenceThreshold);
    
    let createdTagIds: string[] = [];
    
    // Optionally create tags in database
    if (createTags && highConfidenceTags.length > 0) {
      createdTagIds = await createTagsInDatabase(highConfidenceTags);
    }
    
    // Optionally update the video with new tags
    if (videoId && createdTagIds.length > 0) {
      try {
        const { getPayloadClient } = await import('../../../../getPayload');
        const payload = await getPayloadClient();
        
        // Get current video to merge with existing tags
        const currentVideo = await payload.findByID({
          collection: 'videos',
          id: videoId
        });
        
        const currentTagIds = Array.isArray(currentVideo.tags) ? currentVideo.tags.map(tag => 
          typeof tag === 'string' ? tag : String(tag.id)
        ) : [];
        
        const mergedTagIds = [...new Set([...currentTagIds, ...createdTagIds])];
        
        await payload.update({
          collection: 'videos',
          id: videoId,
          data: {
            tags: mergedTagIds
          }
        });
        
        return NextResponse.json({
          ...analysis,
          highConfidenceTags,
          createdTagIds,
          updated: true,
          videoId,
          totalTags: mergedTagIds.length
        });
      } catch (updateError) {
        console.error('Error updating video with tags:', updateError);
        return NextResponse.json({
          ...analysis,
          highConfidenceTags,
          createdTagIds,
          updated: false,
          error: 'Failed to update video'
        });
      }
    }
    
    return NextResponse.json({
      ...analysis,
      highConfidenceTags,
      createdTagIds: createTags ? createdTagIds : []
    });
    
  } catch (error) {
    console.error('Enhanced tags analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze tags' }, { status: 500 });
  }
}
