import { NextResponse } from 'next/server';
import { validateAutomationUser } from '../../../../utils/validateAutomationUser';

// Skill level analysis using AI/heuristics
function analyzeSkillLevel(title: string, description: string, tags: string[] = []): {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  reasoning: string;
} {
  const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  
  // Beginner indicators
  const beginnerKeywords = [
    'intro', 'introduction', 'basics', 'getting started', 'tutorial', 'beginners',
    'first', 'start', 'simple', 'easy', 'basic', 'guide', 'how to', 'step by step',
    'fundamentals', 'overview', 'new to', 'learn', 'what is', 'explained',
    'for beginners', 'startup', 'zero to', 'from scratch'
  ];
  
  // Intermediate indicators  
  const intermediateKeywords = [
    'best practices', 'optimization', 'tips', 'tricks', 'workflow', 'automation',
    'integration', 'setup', 'configuration', 'customize', 'improve', 'enhance',
    'scaling', 'production', 'deploy', 'real world', 'practical', 'project',
    'building', 'creating', 'developing', 'intermediate'
  ];
  
  // Advanced indicators
  const advancedKeywords = [
    'advanced', 'expert', 'complex', 'architecture', 'performance', 'optimization',
    'deep dive', 'internals', 'low level', 'system design', 'enterprise',
    'scalability', 'security', 'debugging', 'troubleshooting', 'mastery',
    'professional', 'production ready', 'custom', 'framework', 'library',
    'api design', 'database design', 'algorithms', 'data structures'
  ];
  
  // Count keyword matches
  const beginnerScore = beginnerKeywords.filter(keyword => content.includes(keyword)).length;
  const intermediateScore = intermediateKeywords.filter(keyword => content.includes(keyword)).length;
  const advancedScore = advancedKeywords.filter(keyword => content.includes(keyword)).length;
  
  // Duration-based hints (from video metadata if available)
  let durationFactor = 0;
  const durationMatch = content.match(/(\d+)\s*(hour|hr|minute|min)/);
  if (durationMatch) {
    const duration = parseInt(durationMatch[1]);
    const unit = durationMatch[2];
    const totalMinutes = unit.includes('hour') || unit.includes('hr') ? duration * 60 : duration;
    
    if (totalMinutes < 10) durationFactor = 1; // Likely beginner
    else if (totalMinutes > 30) durationFactor = -1; // Likely advanced
  }
  
  // Calculate final scores
  const adjustedBeginnerScore = beginnerScore + Math.max(0, durationFactor);
  const adjustedAdvancedScore = advancedScore + Math.max(0, -durationFactor);
  
  // Determine skill level
  let skillLevel: 'beginner' | 'intermediate' | 'advanced';
  let confidence: number;
  let reasoning: string;
  
  if (adjustedBeginnerScore > intermediateScore && adjustedBeginnerScore > adjustedAdvancedScore) {
    skillLevel = 'beginner';
    confidence = Math.min(0.9, 0.5 + (adjustedBeginnerScore * 0.1));
    reasoning = `Strong beginner indicators: ${beginnerKeywords.filter(k => content.includes(k)).slice(0, 3).join(', ')}`;
  } else if (adjustedAdvancedScore > intermediateScore && adjustedAdvancedScore > adjustedBeginnerScore) {
    skillLevel = 'advanced';
    confidence = Math.min(0.9, 0.5 + (adjustedAdvancedScore * 0.1));
    reasoning = `Strong advanced indicators: ${advancedKeywords.filter(k => content.includes(k)).slice(0, 3).join(', ')}`;
  } else if (intermediateScore > 0 || (adjustedBeginnerScore === adjustedAdvancedScore && adjustedBeginnerScore > 0)) {
    skillLevel = 'intermediate';
    confidence = Math.min(0.8, 0.4 + (intermediateScore * 0.1));
    reasoning = intermediateScore > 0 
      ? `Intermediate indicators found: ${intermediateKeywords.filter(k => content.includes(k)).slice(0, 3).join(', ')}`
      : 'Mixed beginner/advanced signals, defaulting to intermediate';
  } else {
    // Default case
    skillLevel = 'intermediate';
    confidence = 0.3;
    reasoning = 'No clear skill level indicators found, using intermediate as default';
  }
  
  return { skillLevel, confidence, reasoning };
}

export async function POST(request: Request) {
  try {
    // Validate automation user
    const authResult = await validateAutomationUser(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, tags, videoId } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Analyze skill level
    const analysis = analyzeSkillLevel(title, description || '', tags || []);
    
    // Optionally update the video directly if videoId is provided
    if (videoId) {
      try {
        const { getPayloadClient } = await import('../../../../getPayload');
        const payload = await getPayloadClient();
        
        await payload.update({
          collection: 'videos',
          id: videoId,
          data: {
            skillLevel: analysis.skillLevel,
          },
        });
        
        return NextResponse.json({
          ...analysis,
          updated: true,
          videoId
        });
      } catch (updateError) {
        console.error('Error updating video:', updateError);
        return NextResponse.json({
          ...analysis,
          updated: false,
          error: 'Failed to update video'
        });
      }
    }
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Skill level analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze skill level' }, { status: 500 });
  }
}
