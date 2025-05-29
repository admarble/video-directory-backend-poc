# 🎯 Webhook-Based MCP Fix Guide

## **✅ What This Fixes**

Your webhook approach is **perfect** for debugging! The issue was that you were using basic HTTP Request nodes instead of **HTTP Request Tool** nodes with proper parameter schemas.

## **🔧 Key Changes Made**

1. **Replaced HTTP Request nodes** with `n8n-nodes-langchain.toolHttpRequest` nodes
2. **Added proper JSON schemas** for each tool with required/optional parameters  
3. **Fixed parameter passing** using `$parameter` instead of `$json`
4. **Added operation routing** to handle different tool calls in one webhook

## **📋 Step-by-Step Implementation**

### **Step 1: Import the Fixed Workflow**
```bash
# Import the corrected workflow
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_N8N_API_KEY" \
  -d @n8n-workflows/mcp-server-webhook-fixed.json
```

### **Step 2: Set Up HTTP Header Auth Credential**
1. Go to n8n → Settings → Credentials
2. Create new **HTTP Header Auth** credential:
   - **Name**: `Payload CMS Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `automation-users API-Key YOUR_API_KEY_HERE`

### **Step 3: Update Your MCP Client**
Your MCP Client configuration should be:
```json
{
  "parameters": {
    "sseEndpoint": "http://host.docker.internal:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse",
    "authentication": "none",
    "toolsToInclude": "all"
  }
}
```

### **Step 4: Test the Tools**

**Test Search Videos:**
```bash
curl -X POST http://localhost:5678/webhook/video-operations \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React tutorials",
    "filters": {
      "limit": 5,
      "skillLevel": "beginner"
    }
  }'
```

**Test Create Video:**
```bash
curl -X POST http://localhost:5678/webhook/video-operations \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Test Video",
    "skillLevel": "intermediate"
  }'
```

## **🔍 Debugging Tips**

### **Check Tool Discovery**
Your AI Agent should now see these tools:
- `Search_Videos_Tool` - Search for videos with query and filters
- `Create_Video_Tool` - Create new video from YouTube URL  
- `Update_Video_Tool` - Update existing video by ID

### **Common Issues & Fixes**

**Issue**: "Tool not found"
**Fix**: Make sure workflow is **Active** and MCP Server Trigger is listening

**Issue**: "Invalid parameters" 
**Fix**: Check that your MCP Client is passing the right parameter names

**Issue**: "Connection refused"
**Fix**: Verify Docker networking - use `host.docker.internal:5678` not `localhost:5678`

### **Monitor Execution**
1. Go to n8n → Executions tab
2. Watch for MCP tool calls
3. Check each node's output for debugging

## **🎯 Why This Works**

1. **HTTP Request Tool nodes** provide proper MCP tool schema definitions
2. **Parameter schemas** tell the MCP client exactly what to send
3. **Single webhook endpoint** handles all operations with routing
4. **Proper error handling** gives meaningful responses

## **🚀 Next Steps**

1. Import the fixed workflow
2. Set up credentials  
3. Activate the workflow
4. Test each tool individually
5. Connect your AI Agent and test the full flow

Your approach was solid - you just needed the right tool types with proper schemas! 🎉
