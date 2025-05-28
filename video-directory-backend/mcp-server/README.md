# 🤖 Video Directory MCP Server

A custom Model Context Protocol (MCP) server built with n8n that provides AI assistants with powerful video content management capabilities for your Payload CMS backend.

## 🎯 Overview

This MCP server exposes your existing video processing infrastructure to AI assistants like Claude Desktop, enabling natural language interactions for:

- **Video Creation**: Process YouTube URLs with AI enhancement
- **Content Analysis**: Skill level detection and tag enhancement  
- **Video Management**: Search, retrieve, and update video content
- **Quality Control**: Automated content assessment and publishing decisions

## 🏗️ Architecture

```
AI Assistant (Claude Desktop) 
    ↓ MCP Protocol
n8n MCP Server Trigger
    ↓ Tool Workflows  
Payload CMS API Endpoints
    ↓ AI Processing
YouTube API + OpenAI Analysis
```

## 🛠️ Available Tools

### 1. `create_video_from_youtube`
**Purpose**: Create a new video entry from a YouTube URL with AI enhancements

**Parameters**:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "options": {
    "enhanceTags": true,        // AI-powered tag suggestions
    "analyzeSkillLevel": true,  // Beginner/intermediate/advanced detection
    "uploadThumbnail": true,    // Download and store thumbnail
    "published": false          // Auto-publish or save as draft
  }
}
```

**Returns**: 
- Video object with AI enhancements
- Processing status for each AI tool
- Success/error status

### 2. `get_video_details`
**Purpose**: Retrieve detailed information about a specific video

**Parameters**:
```json
{
  "videoId": "video-id-string"
}
```

**Returns**: Complete video object with all metadata

### 3. `update_video_fields`
**Purpose**: Update specific fields of an existing video

**Parameters**:
```json
{
  "videoId": "video-id-string",
  "updates": {
    "title": "New title",
    "description": "Updated description",
    "published": true,
    "skillLevel": "intermediate",
    "tags": ["tag1", "tag2"],
    "categories": ["category-id"]
  }
}
```

**Returns**: Updated video object

### 4. `search_videos`
**Purpose**: Search for videos using text queries and filters

**Parameters**:
```json
{
  "query": "search terms",
  "filters": {
    "limit": 10,
    "page": 1,
    "published": true,
    "skillLevel": "beginner",
    "category": "category-name",
    "tag": "tag-name"
  }
}
```

**Returns**: Paginated search results with metadata

### 5. `analyze_skill_level`
**Purpose**: Analyze content to determine skill level (beginner/intermediate/advanced)

**Parameters**:
```json
{
  "title": "Video title",
  "description": "Video description",
  "tags": ["existing", "tags"]
}
```

**Returns**: Skill level classification with confidence score and reasoning

### 6. `enhance_tags`
**Purpose**: Generate AI-powered tag suggestions for content

**Parameters**:
```json
{
  "title": "Video title", 
  "description": "Video description",
  "existingTags": ["current", "tags"]
}
```

**Returns**: Enhanced tag suggestions with confidence scores

## 🚀 Setup Instructions

### Step 1: Import Workflows to n8n

1. Open your n8n instance (http://localhost:5678)
2. Import the main MCP server workflow:
   - Go to **Workflows** → **Import from file**
   - Select: `workflows/mcp-server-main.json`

3. Import all tool workflows from the `workflows/tools/` directory:
   - `create-video-tool.json`
   - `get-video-tool.json` 
   - `update-video-tool.json`
   - `search-videos-tool.json`
   - `analyze-skill-level-tool.json`
   - `enhance-tags-tool.json`

### Step 2: Configure Authentication

1. In n8n, create a new **HTTP Header Auth** credential:
   - **Name**: `Payload CMS Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `automation-users API-Key 81d19ec-911c-4fe4-92aa-18aadf6659d5`

2. Apply this credential to all HTTP Request nodes in the tool workflows

### Step 3: Update Workflow IDs

1. After importing, note the workflow IDs for each tool workflow
2. Update the main MCP server workflow to reference these IDs:
   - Replace `CREATE_VIDEO_WORKFLOW_ID` with actual ID
   - Replace `GET_VIDEO_WORKFLOW_ID` with actual ID
   - Continue for all tools...

### Step 4: Configure MCP Server

1. In the main MCP server workflow, configure the MCP Server Trigger:
   - **Authentication**: Bearer Token
   - **Exposed Workflows**: Include specific workflows
   - **Workflows to Include**: Select all your tool workflows

2. Activate the workflow and note the SSE endpoint URL

### Step 5: Connect to Claude Desktop

1. Copy the SSE endpoint URL from your n8n MCP server
2. Update `config/claude-desktop-config.json`:
   ```json
   {
     "mcpServers": {
       "video-directory": {
         "command": "npx",
         "args": ["-y", "supergateway", "--sse", "YOUR_SSE_ENDPOINT_URL"]
       }
     }
   }
   ```

3. Add this configuration to your Claude Desktop settings

## 🔧 Usage Examples

### Creating a Video with AI Enhancement
```
"Please process this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ with full AI analysis"
```

### Searching for Content
```
"Find all beginner-level React videos that are published"
```

### Updating Video Content
```
"Update video ID abc123 to set the skill level to advanced and publish it"
```

### Analyzing Content
```
"Analyze the skill level for a video titled 'Advanced TypeScript Patterns' with description about complex type systems"
```

## 🛡️ Security Features

- **Authentication**: Secure API key validation for all operations
- **Input Validation**: Comprehensive parameter validation and sanitization
- **Field Restrictions**: Limited update fields to prevent unauthorized changes
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Graceful error responses without exposing sensitive data

## 🔍 Monitoring and Troubleshooting

### Health Checks
```bash
# Test Payload CMS connectivity
curl -f http://localhost:3001/api/videos?limit=1

# Test authentication
curl -X POST http://localhost:3001/api/ai-tools/skill-level \
  -H "Authorization: automation-users API-Key YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test"}'
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Verify n8n and Payload CMS are running |
| Authentication failed | Check API key format and permissions |
| Tool not found | Verify workflow IDs in main MCP server |
| Timeout errors | Increase timeout values in HTTP Request nodes |

### Debug Steps

1. **Check n8n execution logs** for detailed error information
2. **Test individual workflows** before testing through MCP
3. **Verify network connectivity** between Docker containers
4. **Check Payload CMS logs** for backend issues

## 📊 Performance Metrics

- **Video Creation**: ~30-60 seconds (includes AI analysis)
- **Video Retrieval**: ~1-2 seconds
- **Search Operations**: ~2-5 seconds
- **AI Analysis**: ~10-20 seconds per operation
- **Concurrent Requests**: Up to 10 simultaneous operations

## 🔮 Future Enhancements

- **Batch Processing**: Handle multiple videos simultaneously
- **Webhook Notifications**: Slack/Discord integration for completed operations
- **Analytics Dashboard**: Usage metrics and performance monitoring
- **Custom AI Models**: Integration with specialized content analysis models
- **Content Scheduling**: Automated publishing workflows

## 🎉 Success Indicators

You'll know the MCP server is working when:
- ✅ Claude Desktop shows available video directory tools
- ✅ Video creation completes with AI enhancements
- ✅ Search returns relevant results
- ✅ All tool operations complete without errors
- ✅ Authentication works seamlessly

---

**Ready to revolutionize your video content workflow with AI! 🚀**
