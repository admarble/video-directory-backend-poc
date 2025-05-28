# 🤖 AI Agent Video Curation Setup Guide

This guide will help you set up a sophisticated AI agent system using n8n to automatically curate YouTube videos for your Payload CMS.

## 🎯 What This System Does

Your AI agent will:
- ✅ Accept YouTube URLs/IDs as input
- ✅ Create video entries in Payload CMS
- ✅ Automatically fetch YouTube metadata (title, description, thumbnail)
- ✅ Detect and create relevant creators, categories, and tags
- ✅ Analyze skill level (beginner/intermediate/advanced)
- ✅ Enhance tags with AI-powered suggestions
- ✅ Make intelligent decisions about content quality
- ✅ Publish or save as drafts based on quality assessment

## 🔧 Setup Steps

### 1. Deploy Backend Changes

First, restart your Payload CMS to pick up the new collections and endpoints:

```bash
cd /Users/tony/Documents/Projects/Video\ Directory\ Backend/video-directory-backend
npm run dev
```

### 2. Create Automation User

1. Open your Payload admin panel at `http://localhost:3001/admin`
2. Navigate to **Automation Users** collection
3. Click **Create New**
4. Fill in:
   - **Name**: "n8n Video Agent"
   - **Purpose**: "AI agent for automated video curation"
   - **Permissions**: "Video Management (Full)"
   - **Rate Limit Tier**: "High (500 req/15min)"
   - **Is Active**: ✅ True

5. Save the entry
6. **Generate API Key**: In the user details, look for the API key section and generate a new key
7. **Copy the full API key** (format: `automation-users API-Key abc123...`)

### 3. Install n8n (if not already installed)

```bash
# Option 1: Docker (Recommended)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e WEBHOOK_URL=http://localhost:5678/ \
  -e PAYLOAD_CMS_URL=http://localhost:3001 \
  -e PAYLOAD_API_KEY="automation-users API-Key YOUR_KEY_HERE" \
  -e OPENAI_API_KEY="your_openai_key_here" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Option 2: npm
npm install n8n -g
n8n start
```

### 4. Configure n8n Environment Variables

Add these environment variables to your n8n instance:

```env
PAYLOAD_CMS_URL=http://localhost:3001
PAYLOAD_API_KEY=automation-users API-Key YOUR_GENERATED_KEY_HERE
OPENAI_API_KEY=your_openai_key_here
```

### 5. Import n8n Workflow

1. Open n8n at `http://localhost:5678`
2. Go to **Workflows**
3. Click **Import from file**
4. Select `n8n-workflows/main-video-agent.json`
5. Activate the workflow

### 6. Test the System

#### Basic Test (via n8n webhook):
```bash
curl -X POST http://localhost:5678/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }'
```

#### Advanced Test (with options):
```bash
curl -X POST http://localhost:5678/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "options": {
      "enhanceTags": true,
      "analyzeSkillLevel": true,
      "publishImmediately": false,
      "qualityThreshold": 0.8
    }
  }'
```

## 🔍 How It Works

### Architecture Overview

```
YouTube URL Input
       ↓
   AI Agent (n8n)
       ↓
┌─────────────────┐
│ 1. Create Video │ → Payload CMS API
│ 2. Fetch Data   │ → YouTube API
│ 3. Analyze Tags │ → AI Analysis
│ 4. Skill Level  │ → AI Analysis
│ 5. Quality Check│ → AI Assessment
└─────────────────┘
       ↓
   Published Video
```

### Processing Pipeline

1. **Video Creation** (`/api/ai-tools/create-video`)
   - Creates basic video entry
   - Calls YouTube API for metadata
   - Auto-creates creators, categories, tags
   - Uploads thumbnail

2. **Enhanced Tag Analysis** (`/api/ai-tools/enhanced-tags`)
   - Analyzes content for additional relevant tags
   - Detects tools/technologies mentioned
   - Creates new tags with confidence scores
   - Updates video with enhanced tags

3. **Skill Level Analysis** (`/api/ai-tools/skill-level`)
   - Analyzes title, description, and tags
   - Determines beginner/intermediate/advanced level
   - Provides confidence score and reasoning
   - Updates video skill level

4. **AI Decision Making**
   - Agent decides which tools to use based on content
   - Makes publishing decisions based on quality
   - Provides detailed reasoning for all actions

## 🎛️ Customization Options

### Adjust AI Agent Behavior

Edit the AI agent prompt in n8n to modify behavior:

```
You are an AI agent specialized in curating video content for a developer/indie hacker community.

QUALITY STANDARDS:
- Only accept videos about: web development, AI/automation, no-code tools, business strategy, SaaS building
- Minimum duration: 5 minutes
- Must have clear title and description
- Skip clickbait or promotional content

SKILL LEVEL GUIDELINES:
- Beginner: "intro", "getting started", "basics", "tutorial"
- Intermediate: "build", "create", "workflow", "best practices"  
- Advanced: "architecture", "scalability", "performance", "advanced"

TAGGING RULES:
- Always include primary technology/tool mentioned
- Add skill level as tag
- Include content type (tutorial, case study, etc.)
- Maximum 8 tags per video
```

### Create Custom Tools

You can add new specialized tools by:

1. Creating new API endpoints in your Payload CMS
2. Adding corresponding n8n workflows
3. Updating the main agent to use your tools

Example tools you could add:
- **Thumbnail Generator**: Creates custom thumbnails
- **Title Optimizer**: Improves SEO-friendly titles
- **Content Summarizer**: Generates short summaries
- **Duplicate Detector**: Checks for similar existing videos

### Quality Assessment Rules

Modify the quality assessment logic by editing the AI prompts:

```javascript
// In your quality assessor tool
const qualityChecks = {
  titleQuality: analyzeTitleClarity(title),
  contentRelevance: analyzeRelevance(description, categories),
  technicalDepth: analyzeTechnicalContent(description),
  communityFit: analyzeCommunityAlignment(tags, categories)
};
```

## 📊 Monitoring & Analytics

### n8n Execution Logs
- View detailed execution history in n8n
- Monitor success/failure rates
- Debug individual workflow steps

### Payload CMS Analytics
```javascript
// Query automation user activity
const stats = await payload.find({
  collection: 'automation-users',
  where: { name: { equals: 'n8n Video Agent' } }
});

// Query recent video creations
const recentVideos = await payload.find({
  collection: 'videos',
  where: { 
    createdAt: { greater_than: new Date(Date.now() - 24*60*60*1000) }
  },
  sort: '-createdAt'
});
```

### Performance Metrics
- Track processing time per video
- Monitor API rate limits
- Analyze tag/category accuracy

## 🔒 Security Considerations

### Rate Limiting
The automation user has built-in rate limiting:
- Standard: 100 requests per 15 minutes
- High: 500 requests per 15 minutes
- Unlimited: No limits (use carefully)

### API Key Security
- Store API keys in environment variables
- Use different keys for different environments
- Rotate keys periodically
- Monitor usage in Payload admin

### Access Control
The automation user can only:
- ✅ Create and update videos
- ✅ Read categories, tags, creators
- ❌ Delete videos (unless "full" permission)
- ❌ Access user data
- ❌ Modify system settings

## 🚀 Advanced Usage

### Batch Processing
```bash
# Process multiple videos
curl -X POST http://localhost:5678/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{
    "batch": [
      {"youtubeUrl": "https://www.youtube.com/watch?v=VIDEO1"},
      {"youtubeUrl": "https://www.youtube.com/watch?v=VIDEO2"},
      {"youtubeUrl": "https://www.youtube.com/watch?v=VIDEO3"}
    ]
  }'
```

### Scheduled Curation
Set up n8n cron trigger to automatically process videos from:
- RSS feeds of favorite channels
- Playlists you want to monitor  
- Community recommendations

### Integration with Other Tools
- **Slack notifications**: Alert when videos are processed
- **Email reports**: Daily/weekly curation summaries
- **Discord webhooks**: Share new videos with community

## 🔧 Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Check API key format
echo $PAYLOAD_API_KEY
# Should be: automation-users API-Key abc123...
```

**YouTube API Errors**
```bash
# Verify YouTube API key
curl "https://www.googleapis.com/youtube/v3/videos?id=dQw4w9WgXcQ&part=snippet&key=YOUR_YOUTUBE_KEY"
```

**n8n Workflow Timeout**
- Increase timeout in n8n workflow settings
- Split long-running operations into smaller steps

**Payload CMS Connection Issues**
```bash
# Test direct API access
curl -H "Authorization: $PAYLOAD_API_KEY" \
     http://localhost:3001/api/videos
```

### Debug Mode
Enable detailed logging:

```env
# In n8n environment
N8N_LOG_LEVEL=debug

# In Payload CMS  
DEBUG=payload:*
```

## 📈 Next Steps

1. **Start with basic setup** and test with a few videos
2. **Monitor results** and adjust AI prompts based on output quality
3. **Add custom tools** for your specific use cases
4. **Scale up** with batch processing and automation
5. **Integrate** with your existing content workflow

The system is designed to learn and improve over time. The more you use it, the better it becomes at understanding your community's content preferences!
