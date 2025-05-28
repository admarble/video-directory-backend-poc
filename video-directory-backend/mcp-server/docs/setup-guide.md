# 🚀 MCP Server Setup Guide

This guide will walk you through setting up your custom Video Directory MCP server step by step.

## Prerequisites

Before starting, ensure you have:

- ✅ **n8n running** (http://localhost:5678)
- ✅ **Payload CMS running** (http://localhost:3001)  
- ✅ **Automation user configured** with API key
- ✅ **Claude Desktop installed** (for testing)

## Step-by-Step Setup

### Phase 1: Import and Configure Workflows

#### 1.1 Import Main MCP Server Workflow

1. Open n8n at http://localhost:5678
2. Go to **Workflows** → **Import from file**
3. Select `workflows/mcp-server-main.json`
4. Click **Import**
5. **Do not activate yet** - we need to configure it first

#### 1.2 Import Tool Workflows

Import each tool workflow from the `workflows/tools/` directory:

1. `create-video-tool.json` → Import and note the workflow ID
2. `get-video-tool.json` → Import and note the workflow ID  
3. `update-video-tool.json` → Import and note the workflow ID
4. `search-videos-tool.json` → Import and note the workflow ID
5. `analyze-skill-level-tool.json` → Import and note the workflow ID
6. `enhance-tags-tool.json` → Import and note the workflow ID

**Important**: Write down each workflow ID as you'll need them for the next step.

#### 1.3 Create Authentication Credential

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **"HTTP Header Auth"**
3. Configure:
   - **Name**: `Payload CMS Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `automation-users API-Key 81d19ec-911c-4fe4-92aa-18aadf6659d5`
4. **Save** the credential

#### 1.4 Apply Credentials to Tool Workflows

For each tool workflow:
1. Open the workflow
2. Click on the **HTTP Request** node
3. In **Credentials**, select **"Payload CMS Auth"**
4. **Save** the workflow

### Phase 2: Configure Main MCP Server

#### 2.1 Update Workflow IDs

1. Open the `mcp-server-main.json` workflow
2. For each tool node, update the `workflowId` parameter:

Replace these placeholders with actual workflow IDs:
- `CREATE_VIDEO_WORKFLOW_ID` → ID of create-video-tool workflow
- `GET_VIDEO_WORKFLOW_ID` → ID of get-video-tool workflow  
- `UPDATE_VIDEO_WORKFLOW_ID` → ID of update-video-tool workflow
- `SEARCH_VIDEOS_WORKFLOW_ID` → ID of search-videos-tool workflow
- `ANALYZE_SKILL_WORKFLOW_ID` → ID of analyze-skill-level-tool workflow
- `ENHANCE_TAGS_WORKFLOW_ID` → ID of enhance-tags-tool workflow

#### 2.2 Configure MCP Server Trigger

1. Click on the **MCP Server Trigger** node
2. Configure:
   - **Authentication**: `Bearer Token`
   - **Exposed Workflows**: `Include specific workflows`
   - **Workflows to Include**: Select all your tool workflows
3. **Save** the configuration

#### 2.3 Activate the MCP Server

1. **Activate** the main MCP server workflow
2. **Copy the SSE endpoint URL** from the MCP Server Trigger node
3. The URL will look like: `https://your-n8n-instance.com/webhook/mcp/abc123`

### Phase 3: Connect to Claude Desktop

#### 3.1 Configure Claude Desktop

1. Open Claude Desktop settings
2. Navigate to **MCP Servers** configuration
3. Add the following configuration:

```json
{
  "mcpServers": {
    "video-directory": {
      "command": "npx",
      "args": [
        "-y", 
        "supergateway", 
        "--sse", 
        "YOUR_SSE_ENDPOINT_URL_HERE"
      ]
    }
  }
}
```

4. Replace `YOUR_SSE_ENDPOINT_URL_HERE` with the actual URL from step 2.3
5. **Restart Claude Desktop**

### Phase 4: Testing and Validation

#### 4.1 Test Individual Tool Workflows

Before testing through MCP, verify each tool workflow works:

1. **Test Create Video Tool**:
   - Open the workflow
   - Click **"Test workflow"**
   - Provide test input:
     ```json
     {
       "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
       "options": {
         "enhanceTags": true,
         "analyzeSkillLevel": true,
         "published": false
       }
     }
     ```

2. **Test Get Video Tool**:
   - Use a valid video ID from your database
   - Input: `{"videoId": "your-video-id"}`

3. **Test Search Tool**:
   - Input: `{"query": "react", "filters": {"limit": 5}}`

#### 4.2 Test MCP Integration

1. **Open Claude Desktop**
2. **Verify MCP tools are loaded**:
   - You should see video directory tools available
   - Look for tools like "create_video_from_youtube", "search_videos", etc.

3. **Test basic functionality**:
   ```
   Can you search for videos about React?
   ```

4. **Test video creation**:
   ```
   Please process this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

### Phase 5: Troubleshooting

#### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Tools not appearing in Claude** | No video tools visible | Check MCP server activation and SSE URL |
| **Authentication errors** | 401/403 responses | Verify API key format and permissions |
| **Workflow not found** | Tool execution fails | Check workflow IDs in main MCP server |
| **Connection timeouts** | Requests hang | Verify network connectivity and timeouts |

#### Debug Commands

```bash
# Test Payload CMS connectivity
curl -f http://localhost:3001/api/videos?limit=1

# Test authentication
curl -X POST http://localhost:3001/api/ai-tools/skill-level \
  -H "Authorization: automation-users API-Key 81d19ec-911c-4fe4-92aa-18aadf6659d5" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test description"}'

# Test n8n webhook (replace with your actual webhook URL)
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### Logs to Check

1. **n8n Execution Logs**: Check individual workflow executions for errors
2. **Payload CMS Logs**: Look for authentication and API errors  
3. **Claude Desktop Logs**: Check MCP connection status
4. **Browser Console**: For any client-side MCP errors

### Phase 6: Production Optimization

#### 6.1 Performance Tuning

1. **Adjust Timeouts**:
   - Video creation: 120 seconds
   - Other operations: 30 seconds
   - MCP client timeout: 60 seconds

2. **Configure Rate Limiting**:
   - Add rate limiting to prevent API abuse
   - Consider implementing queue-based processing

3. **Enable Monitoring**:
   - Set up execution logging
   - Monitor API response times
   - Track success/failure rates

#### 6.2 Security Hardening

1. **Review API Key Permissions**:
   - Ensure automation user has minimal required permissions
   - Regularly rotate API keys

2. **Input Validation**:
   - All tools include comprehensive input validation
   - Sanitize user inputs before processing

3. **Network Security**:
   - Use HTTPS endpoints in production
   - Implement proper firewall rules

## 🎉 Success Checklist

- [ ] All tool workflows imported and configured
- [ ] Authentication credential created and applied
- [ ] Main MCP server workflow activated  
- [ ] SSE endpoint URL copied
- [ ] Claude Desktop configured with MCP server
- [ ] Individual tool workflows tested successfully
- [ ] MCP integration tested through Claude Desktop
- [ ] Video creation and search working end-to-end

## 🚀 You're Ready!

Once all items are checked, your MCP server is ready for production use. You can now:

- **Create videos** with natural language commands
- **Search and manage** your video content
- **Analyze skill levels** and enhance tags automatically  
- **Update video properties** through conversational AI

**Example Commands to Try**:
- "Find all beginner React videos and update them to be published"
- "Process this YouTube video and analyze its skill level"
- "Search for videos about TypeScript that are marked as advanced"
- "Create a new video from this URL with full AI enhancement"

**Enjoy your AI-powered video content management system! 🎬✨**
