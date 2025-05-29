# MCP Connection Troubleshooting Guide

## Current Issues Identified:

1. **MCP Server Trigger Not Active**: Your workflow shows `"active": false` - this must be `true`
2. **Authentication Mismatch**: Both server and client must use identical auth
3. **Docker Networking**: SSE endpoints need proper Docker internal networking

## Fixes Required:

### Step 1: Activate Your Workflow
1. In n8n, go to your workflow
2. Click the "Active" toggle in the top right
3. Ensure the MCP Server Trigger shows as "Listening for MCP events"

### Step 2: Verify MCP Server Trigger Configuration
```json
{
  "parameters": {
    "authentication": "headerAuth", 
    "path": "754ab685-0173-4eec-a996-1d56f9dc8339"
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "EKTjxInGTuBHtabl",
      "name": "Header Auth account"
    }
  }
}
```

### Step 3: Fix MCP Client SSE Endpoint
Change your MCP Client SSE Endpoint from:
```
http://host.docker.internal:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse
```

To (remove authentication if not needed):
```
http://host.docker.internal:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse
```

### Step 4: Test Connection Steps

1. **Start n8n with fixes**:
   ```bash
   cd /Users/tony/Documents/Projects/Video\ Directory\ Backend/video-directory-backend
   docker-compose -f docker-compose.n8n.yml up -d
   ```

2. **Activate workflow**: Set `"active": true` in your workflow

3. **Test MCP Server endpoint manually**:
   ```bash
   curl -H "Authorization: Bearer your-token" \
        http://localhost:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse
   ```

4. **Check n8n logs**:
   ```bash
   docker logs n8n-video-agent -f
   ```

## Alternative Solutions:

### Option A: Remove Authentication (for testing)
1. Set MCP Server Trigger authentication to "None"
2. Set MCP Client authentication to "None"
3. Test connection without auth first

### Option B: Use Self-Connection Pattern
Instead of MCP Client connecting to itself, create separate workflows:
1. **Workflow 1**: MCP Server with tools only
2. **Workflow 2**: AI Agent with MCP Client pointing to Workflow 1

### Option C: Local Testing
1. Run n8n locally (not in Docker) for testing
2. Use `http://localhost:5678/mcp/...` URLs
3. Once working, migrate back to Docker with fixes

## Expected Working URLs:
- **Test URL**: `http://host.docker.internal:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse`
- **Production URL**: `http://host.docker.internal:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse`

## Debug Commands:
```bash
# Check if n8n is running
docker ps | grep n8n

# Check n8n logs
docker logs n8n-video-agent

# Test SSE endpoint
curl -N -H "Accept:text/event-stream" http://localhost:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse

# Check network connectivity
docker exec n8n-video-agent ping host.docker.internal
```

## Success Indicators:
- MCP Server Trigger shows "Listening for MCP events"  
- MCP Client successfully discovers tools
- AI Agent can execute MCP tools without errors
- SSE connection remains stable during execution
