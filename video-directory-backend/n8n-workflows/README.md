# n8n AI Agent Video Curation Workflow

This directory contains the n8n workflows for the AI agent video curation system.

## Workflow Files

1. **main-video-agent.json** - Main orchestrator AI agent
2. **skill-level-analyzer.json** - Specialized skill level analysis workflow
3. **tag-enhancer.json** - Advanced tag generation workflow
4. **quality-assessor.json** - Video quality and relevance assessment

## Setup Instructions

### 1. Prerequisites
- n8n instance running (self-hosted or cloud)
- API key from your Payload CMS automation user
- Environment variables configured

### 2. Environment Variables

Add these to your n8n environment:

```env
PAYLOAD_CMS_URL=http://localhost:3001
PAYLOAD_API_KEY=automation-users API-Key YOUR_GENERATED_KEY_HERE
OPENAI_API_KEY=your_openai_key_here  # For AI agent functionality
```

### 3. Import Workflows

1. Open n8n web interface
2. Go to Workflows
3. Click "Import from file"
4. Import each JSON file
5. Configure credentials as needed

### 4. Workflow Descriptions

#### Main Video Agent
- **Purpose**: Orchestrates the entire video curation process
- **Input**: YouTube URL or ID
- **Process**: 
  - Creates video entry
  - Calls YouTube API
  - Decides which enhancement tools to use
  - Publishes or saves as draft
- **Tools Available**:
  - Skill Level Analyzer
  - Tag Enhancer
  - Quality Assessor

#### Skill Level Analyzer
- **Purpose**: Determines beginner/intermediate/advanced skill level
- **Input**: Video title, description, tags
- **Output**: Skill level with confidence score

#### Tag Enhancer
- **Purpose**: Suggests additional relevant tags
- **Input**: Video content analysis
- **Output**: List of suggested tags with confidence scores

#### Quality Assessor
- **Purpose**: Evaluates video quality and relevance
- **Input**: All video metadata
- **Output**: Quality score and recommendations

## Usage Examples

### Basic Usage (Webhook)
```bash
curl -X POST https://your-n8n-instance.com/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

### Advanced Usage (API)
```bash
curl -X POST https://your-n8n-instance.com/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "options": {
      "enhanceTags": true,
      "analyzeSkillLevel": true,
      "publishImmediately": false,
      "qualityThreshold": 0.8
    }
  }'
```

## Customization

### Adding New Tools
1. Create new workflow for your tool
2. Add webhook trigger
3. Update main agent to call your tool

### Modifying AI Prompts
- Edit the AI nodes in each workflow
- Adjust prompts for your content domain
- Update confidence thresholds

## Troubleshooting

### Common Issues
1. **Authentication Failed**: Check API key format and permissions
2. **Workflow Timeout**: Increase timeout settings for long videos
3. **Rate Limiting**: Adjust delay between API calls

### Logs
- Check n8n execution logs for detailed error information
- Enable debug mode for development

## Support

For issues specific to:
- **Payload CMS**: Check server logs and API endpoints
- **n8n Workflows**: Review execution history
- **AI Analysis**: Validate input data and API responses
